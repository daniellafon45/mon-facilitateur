const MODEL_ID = "google/nano-banana-2/text-to-image";
const API_BASE = "https://model-api.runcomfy.net/v1";

export function buildContactPortraitPrompt(name: string, role: string) {
  const roleHint = role && role !== "Sans rôle" ? `, working as ${role}` : "";
  return (
    `Professional corporate headshot portrait photo of ${name}${roleHint}, ` +
    "friendly natural smile, soft studio lighting, neutral blurred office background, " +
    "shoulders visible, realistic skin texture, photorealistic, sharp focus on face, " +
    "diverse professional appearance, square 1:1 framing, high quality"
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractImageUrl(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;

  if (typeof r.image_url === "string") return r.image_url;
  if (typeof r.url === "string") return r.url;

  const output = r.output;
  if (typeof output === "string" && output.startsWith("http")) return output;
  if (output && typeof output === "object") {
    const o = output as Record<string, unknown>;
    if (typeof o.image_url === "string") return o.image_url;
    if (Array.isArray(o.images) && o.images[0]) {
      const img = o.images[0];
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && typeof (img as { url?: string }).url === "string") {
        return (img as { url: string }).url;
      }
    }
  }

  if (Array.isArray(r.images) && r.images[0]) {
    const img = r.images[0];
    if (typeof img === "string") return img;
    if (img && typeof img === "object" && typeof (img as { url?: string }).url === "string") {
      return (img as { url: string }).url;
    }
  }

  return null;
}

export async function generatePortraitWithNanoBanana2(
  prompt: string,
  token: string,
): Promise<ArrayBuffer> {
  const submitRes = await fetch(`${API_BASE}/models/${MODEL_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "1:1",
      resolution: "1K",
      output_format: "jpeg",
      num_images: 1,
    }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`RunComfy submit failed (${submitRes.status}): ${err}`);
  }

  const submitJson = (await submitRes.json()) as { request_id?: string };
  const requestId = submitJson.request_id;
  if (!requestId) throw new Error("RunComfy: request_id manquant");

  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    const statusRes = await fetch(`${API_BASE}/requests/${requestId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!statusRes.ok) continue;
    const statusJson = (await statusRes.json()) as { status?: string };
    if (statusJson.status === "completed") break;
    if (statusJson.status === "failed" || statusJson.status === "cancelled") {
      throw new Error(`RunComfy: génération ${statusJson.status}`);
    }
  }

  const resultRes = await fetch(`${API_BASE}/requests/${requestId}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resultRes.ok) {
    throw new Error(`RunComfy result failed (${resultRes.status})`);
  }

  const resultJson = await resultRes.json();
  const imageUrl = extractImageUrl(resultJson);
  if (!imageUrl) {
    throw new Error("RunComfy: URL d'image introuvable dans la réponse");
  }

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Téléchargement de l'image générée échoué");
  return imgRes.arrayBuffer();
}
