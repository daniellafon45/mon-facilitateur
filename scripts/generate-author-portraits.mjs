/**
 * Portraits des auteurs — Nano Banana 2 (RunComfy API directe, compatible Windows).
 *
 * Prérequis : RUNCOMFY_TOKEN dans .env.local (ou variable d'environnement)
 * Usage : node scripts/generate-author-portraits.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "authors");
const MODEL_ID = "google/nano-banana-2/text-to-image";
const API_BASE = "https://model-api.runcomfy.net/v1";

const AUTHORS = [
  {
    id: "margaret-mead",
    name: "Margaret Mead",
    prompt:
      "Classic black and white documentary portrait photograph of Margaret Mead, American anthropologist, 1950s professional headshot, thoughtful expression, soft studio lighting, photorealistic historical archive, no text",
  },
  {
    id: "albert-einstein",
    name: "Albert Einstein",
    prompt:
      "Iconic black and white portrait photograph of Albert Einstein, physicist with distinctive wild hair and mustache, warm wise expression, classic 1940s studio portrait, photorealistic, no text",
  },
  {
    id: "antoine-saint-exupery",
    name: "Antoine de Saint-Exupéry",
    prompt:
      "Vintage black and white portrait photograph of Antoine de Saint-Exupéry, French writer and aviator, 1930s, elegant suit, thoughtful gaze, photorealistic historical portrait, no text",
  },
  {
    id: "peter-drucker",
    name: "Peter Drucker",
    prompt:
      "Professional color portrait photograph of Peter Drucker, management thinker, elderly man with glasses, warm smile, business attire, soft office lighting, photorealistic, no text",
  },
  {
    id: "voltaire",
    name: "Voltaire",
    prompt:
      "Classic 18th century oil painting portrait of Voltaire, French Enlightenment philosopher, powdered wig, intelligent expression, museum quality fine art reproduction, no text",
  },
  {
    id: "paulo-coelho",
    name: "Paulo Coelho",
    prompt:
      "Contemporary color portrait photograph of Paulo Coelho, Brazilian novelist, silver hair, warm charismatic smile, literary event backdrop blurred, photorealistic, no text",
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadToken() {
  if (process.env.RUNCOMFY_TOKEN) return process.env.RUNCOMFY_TOKEN;
  try {
    const env = await readFile(join(ROOT, ".env.local"), "utf8");
    const match = env.match(/^RUNCOMFY_TOKEN=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    /* ignore */
  }
  return null;
}

function extractImageUrl(result) {
  if (!result || typeof result !== "object") return null;
  if (typeof result.image_url === "string") return result.image_url;
  if (typeof result.url === "string") return result.url;
  const output = result.output;
  if (typeof output === "string" && output.startsWith("http")) return output;
  if (output && typeof output === "object") {
    if (typeof output.image_url === "string") return output.image_url;
    const images = output.images;
    if (Array.isArray(images) && images[0]) {
      const img = images[0];
      return typeof img === "string" ? img : img?.url ?? null;
    }
  }
  if (Array.isArray(result.images) && result.images[0]) {
    const img = result.images[0];
    return typeof img === "string" ? img : img?.url ?? null;
  }
  return null;
}

async function generateOne(author, token) {
  const submitRes = await fetch(`${API_BASE}/models/${MODEL_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: author.prompt,
      aspect_ratio: "1:1",
      resolution: "1K",
      output_format: "webp",
      num_images: 1,
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`RunComfy submit (${author.id}): ${await submitRes.text()}`);
  }

  const { request_id: requestId } = await submitRes.json();
  if (!requestId) throw new Error(`RunComfy: request_id manquant (${author.id})`);

  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    const statusRes = await fetch(`${API_BASE}/requests/${requestId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!statusRes.ok) continue;
    const { status } = await statusRes.json();
    if (status === "completed") break;
    if (status === "failed" || status === "cancelled") {
      throw new Error(`RunComfy: génération ${status} (${author.id})`);
    }
  }

  const resultRes = await fetch(`${API_BASE}/requests/${requestId}/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resultRes.ok) throw new Error(`RunComfy result failed (${author.id})`);

  const imageUrl = extractImageUrl(await resultRes.json());
  if (!imageUrl) throw new Error(`URL image introuvable (${author.id})`);

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Téléchargement échoué (${author.id})`);

  const outPath = join(OUT_DIR, `${author.id}.webp`);
  await writeFile(outPath, Buffer.from(await imgRes.arrayBuffer()));
  console.log(`✓ ${author.id} → ${outPath}`);
  return `/authors/${author.id}.webp`;
}

async function main() {
  const token = await loadToken();
  if (!token) {
    console.error("RUNCOMFY_TOKEN manquant. Ajoutez-le dans .env.local puis relancez.");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const mapping = {};

  for (const author of AUTHORS) {
    console.log(`→ ${author.name}…`);
    mapping[author.id] = await generateOne(author, token);
  }

  await writeFile(
    join(ROOT, "src", "lib", "data", "author-portraits.generated.json"),
    JSON.stringify(mapping, null, 2),
  );
  console.log("Terminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
