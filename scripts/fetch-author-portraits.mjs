/**
 * Télécharge des portraits Wikimedia Commons vers public/authors/
 * (fallback si RUNCOMFY_TOKEN indisponible).
 *
 * Usage : node scripts/fetch-author-portraits.mjs
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "authors");

/** `file` = nom exact Commons ; sinon `search` pour recherche API. */
const AUTHORS = [
  { id: "margaret-mead", file: "Margaret Mead (1901-1978).jpg" },
  { id: "albert-einstein", file: "Albert Einstein Head.jpg" },
  { id: "antoine-saint-exupery", file: "Antoine de Saint-Euxpery (1920).jpg" },
  { id: "peter-drucker", file: "Drucker5789.jpg" },
  { id: "voltaire", file: "François-Marie Arouet, dit Voltaire (1694-1778) portrait (A).jpg" },
  { id: "paulo-coelho", file: "Paulo Coelho 2007-04-09 001 (cropped).jpg" },
];

async function resolveCommonsUrl(filename) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}` +
    "&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json";
  const res = await fetch(api);
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`Fichier introuvable : ${filename}`);
  return info.thumburl ?? info.url;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const mapping = {};

  for (const author of AUTHORS) {
    console.log(`→ ${author.id}…`);
    const extCandidates = ["jpg", "png", "webp"];
    let existing = null;
    for (const ext of extCandidates) {
      try {
        await access(join(OUT_DIR, `${author.id}.${ext}`));
        existing = `/authors/${author.id}.${ext}`;
        break;
      } catch {
        /* not found */
      }
    }
    if (existing) {
      mapping[author.id] = existing;
      console.log(`  ↷ déjà présent : ${existing}`);
      continue;
    }

    const url = await resolveCommonsUrl(author.file);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Téléchargement échoué : ${author.id} (${res.status})`);
    const ext = url.includes(".png") ? "png" : "jpg";
    const outPath = join(OUT_DIR, `${author.id}.${ext}`);
    await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
    mapping[author.id] = `/authors/${author.id}.${ext}`;
    console.log(`  ✓ ${mapping[author.id]}`);
  }

  await writeFile(
    join(ROOT, "src", "lib", "data", "author-portraits.generated.json"),
    JSON.stringify(mapping, null, 2),
  );
  console.log("\nTerminé.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
