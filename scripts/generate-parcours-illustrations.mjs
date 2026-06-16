/**
 * Génère les illustrations Nano Banana 2 pour les parcours Apprendre.
 *
 * Prérequis : npm i -g @runcomfy/cli && runcomfy login (ou RUNCOMFY_TOKEN)
 * Usage : node scripts/generate-parcours-illustrations.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "learn", "parcours");

const PARCOURS = [
  {
    id: "p1",
    title: "De l'idée à la solution",
    prompt:
      "Cinematic realistic photo of a diverse creative team brainstorming around a table covered with colorful sticky notes and sketches, warm natural office lighting, shallow depth of field, editorial photography style, no text",
  },
  {
    id: "p2",
    title: "Innover avec impact",
    prompt:
      "Cinematic realistic photo of a modern glass innovation hub at golden hour, professionals walking with laptops, clean architecture, optimistic tone, ultra-detailed, no text",
  },
  {
    id: "p3",
    title: "Ateliers créatifs efficaces",
    prompt:
      "Cinematic realistic photo of a facilitator leading a creative workshop, participants collaborating with post-it walls, bright collaborative space, documentary style, no text",
  },
  {
    id: "p4",
    title: "Résoudre des problèmes complexes",
    prompt:
      "Cinematic realistic photo of an analyst studying complex data dashboards and flow diagrams on multiple screens, focused problem-solving atmosphere, cool tones, no text",
  },
  {
    id: "p5",
    title: "Design Thinking",
    prompt:
      "Cinematic realistic photo of a UX researcher interviewing a user with a prototype on a table, empathy and design thinking session, soft daylight, no text",
  },
  {
    id: "p6",
    title: "Faciliter avec aisance",
    prompt:
      "Cinematic realistic photo of a calm professional facilitator guiding a roundtable discussion in a modern meeting room, engaged participants, natural light, no text",
  },
];

async function generateOne(item) {
  const input = JSON.stringify({
    prompt: item.prompt,
    aspect_ratio: "16:9",
    resolution: "1K",
    output_format: "webp",
  });

  console.log(`→ ${item.id} (${item.title})`);
  execSync(
    `runcomfy run google/nano-banana-2/text-to-image --input '${input.replace(/'/g, "'\\''")}' --output-dir "${OUT_DIR}"`,
    { stdio: "inherit", cwd: ROOT },
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const item of PARCOURS) {
    await generateOne(item);
  }
  const mapping = Object.fromEntries(PARCOURS.map((p) => [p.id, `/learn/parcours/${p.id}.webp`]));
  await writeFile(join(ROOT, "src", "lib", "learn", "parcours-images.generated.json"), JSON.stringify(mapping, null, 2));
  console.log("Terminé. Renommez les fichiers générés en p1.webp … p6.webp si besoin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
