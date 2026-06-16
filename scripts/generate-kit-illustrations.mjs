/**
 * Génère les illustrations Nano Banana 2 pour les kits d'activité.
 *
 * Prérequis : npm i -g @runcomfy/cli && runcomfy login (ou RUNCOMFY_TOKEN)
 * Usage : node scripts/generate-kit-illustrations.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "learn", "kits");

const KITS = [
  {
    id: "marshmallow",
    title: "Marshmallow Challenge",
    prompt:
      "Cinematic realistic photo of a team building a tall spaghetti and marshmallow tower on a conference table, collaborative workshop atmosphere, warm natural lighting, shallow depth of field, editorial photography, no text",
  },
  {
    id: "tour-papier",
    title: "Tour de papier",
    prompt:
      "Cinematic realistic photo of a tall paper tower structure made from stacked white sheets on a desk, creative team challenge, bright office lighting, ultra-detailed, no text",
  },
  {
    id: "pont",
    title: "Pont collaboratif",
    prompt:
      "Cinematic realistic photo of a wooden craft stick bridge structure being tested with a small weight, engineering team challenge on a table, documentary style, no text",
  },
  {
    id: "egg-drop",
    title: "Défi œuf protégé",
    prompt:
      "Cinematic realistic photo of a protective egg drop device made from straws cotton and tape on a workshop table, innovation challenge, soft daylight, no text",
  },
  {
    id: "avion",
    title: "Avion en papier",
    prompt:
      "Cinematic realistic photo of colorful paper airplanes mid-flight in a bright meeting room, team competition, dynamic motion blur, no text",
  },
  {
    id: "trombones",
    title: "Chaîne de trombones",
    prompt:
      "Cinematic realistic photo of a long chain of linked metal paperclips stretched across a white table, optimization team exercise, macro detail, no text",
  },
  {
    id: "lego",
    title: "Défi Lego",
    prompt:
      "Cinematic realistic photo of diverse hands building a colorful Lego prototype together, creative problem solving workshop, vibrant colors, no text",
  },
  {
    id: "prototype-carton",
    title: "Prototype carton",
    prompt:
      "Cinematic realistic photo of a cardboard prototype model being assembled with tape and markers, maker workshop, warm industrial lighting, no text",
  },
  {
    id: "instructions",
    title: "Instructions impossibles",
    prompt:
      "Cinematic realistic photo of two colleagues in a communication exercise, one describing while the other draws, sticky notes nearby, natural office light, no text",
  },
  {
    id: "publicite",
    title: "Publicité express",
    prompt:
      "Cinematic realistic photo of a small team pitching a creative advertising campaign with sketches and post-it notes on a wall, energetic startup vibe, no text",
  },
  {
    id: "negociation",
    title: "Négociation",
    prompt:
      "Cinematic realistic photo of a business negotiation at a round table with documents and tokens, professional atmosphere, balanced lighting, no text",
  },
  {
    id: "survie",
    title: "Mission de survie",
    prompt:
      "Cinematic realistic photo of a survival scenario card game spread on a table, team prioritizing equipment cards, dramatic moody lighting, no text",
  },
  {
    id: "budget",
    title: "Budget impossible",
    prompt:
      "Cinematic realistic photo of a project budget planning session with play money sticky notes and charts on a table, finance workshop, no text",
  },
  {
    id: "ville-durable",
    title: "Ville durable",
    prompt:
      "Cinematic realistic photo of a sustainable city board game with building tiles and green spaces on a table, urban planning workshop, no text",
  },
  {
    id: "production",
    title: "Chaîne de production",
    prompt:
      "Cinematic realistic photo of a mini paper factory assembly line on a conference table, lean production team exercise, overhead angle, no text",
  },
  {
    id: "escape",
    title: "Mini Escape Game",
    prompt:
      "Cinematic realistic photo of an escape room puzzle setup with envelopes locks and clue cards on a wooden table, mystery atmosphere, warm lamp light, no text",
  },
];

async function generateOne(item) {
  const input = JSON.stringify({
    prompt: item.prompt,
    aspect_ratio: "4:3",
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
  for (const item of KITS) {
    await generateOne(item);
  }
  const mapping = Object.fromEntries(KITS.map((k) => [k.id, `/learn/kits/${k.id}.webp`]));
  await writeFile(
    join(ROOT, "src", "lib", "learn", "kit-images.generated.json"),
    JSON.stringify(mapping, null, 2),
  );
  console.log("Terminé. Renommez les fichiers générés en {id}.webp si besoin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
