/**
 * Génère les illustrations Nano Banana 2 pour le wizard.
 *
 * Prérequis : npm i -g @runcomfy/cli && runcomfy login (ou RUNCOMFY_TOKEN)
 * Usage :
 *   node scripts/generate-wizard-images.mjs           # tout générer
 *   node scripts/generate-wizard-images.mjs --skip-existing
 *   node scripts/generate-wizard-images.mjs --group=agenda
 */

import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_WIZARD = join(ROOT, "public", "wizard");

const GROUP_DIRS = {
  univers: join(PUBLIC_WIZARD, "univers"),
  modes: join(PUBLIC_WIZARD, "modes"),
  genres: join(PUBLIC_WIZARD, "genres"),
  solo: join(PUBLIC_WIZARD, "solo"),
  launch: join(PUBLIC_WIZARD, "launch"),
  agenda: join(PUBLIC_WIZARD, "agenda"),
};

const STYLE = "Cinematic realistic editorial photo, shallow depth of field, no text, no logos";

const ITEMS = [
  // Univers
  { id: "academique", group: "univers", title: "Académique", prompt: `${STYLE}, student with books and laptop in bright modern campus library, soft blue tones` },
  { id: "creation", group: "univers", title: "Création personnelle", prompt: `${STYLE}, personal creative workspace with sketchbook pencils watercolor, warm amber natural light` },
  { id: "entrepreneurial", group: "univers", title: "Innovation et entrepreneuriat", prompt: `${STYLE}, startup team around whiteboard in innovation hub, purple accent lighting` },
  { id: "pro", group: "univers", title: "Entreprise", prompt: `${STYLE}, professional team meeting in modern open office, green natural tones` },
  // Modes
  { id: "solo", group: "modes", title: "Solo", prompt: `${STYLE}, one person focused working alone with laptop in calm quiet space, soft violet ambient light` },
  { id: "equipe", group: "modes", title: "Équipe", prompt: `${STYLE}, small team collaborating around table, blue tones, engaged discussion` },
  { id: "atelier", group: "modes", title: "Grand atelier", prompt: `${STYLE}, large facilitation workshop with multiple breakout groups in spacious room, green accents, wide angle` },
  // Genres solo
  { id: "s_capture", group: "genres", title: "Capture d'idées", prompt: `${STYLE}, person quickly jotting ideas in notebook at desk, warm amber light, creative flow` },
  { id: "s_clarifier", group: "genres", title: "Clarifier une décision", prompt: `${STYLE}, person weighing options with pros cons list on paper, blue tones, thoughtful mood` },
  { id: "s_brainstorm", group: "genres", title: "Brainstorming solo", prompt: `${STYLE}, solo ideation with sticky notes on wall, green accents, energetic creativity` },
  { id: "s_structurer", group: "genres", title: "Structurer un document", prompt: `${STYLE}, organized document outline on desk with laptop, blue professional tones` },
  { id: "s_probleme", group: "genres", title: "Résolution de problème solo", prompt: `${STYLE}, person analyzing problem with mind map on whiteboard, violet tones` },
  { id: "s_ecriture", group: "genres", title: "Session d'écriture", prompt: `${STYLE}, deep writing session at desk with coffee, blue calm atmosphere, focused concentration` },
  { id: "s_reflexion", group: "genres", title: "Réflexion personnelle", prompt: `${STYLE}, person in quiet reflection with journal overlooking window, violet soft light` },
  { id: "s_projet", group: "genres", title: "Projet perso long cours", prompt: `${STYLE}, long term personal project board with timeline and notes, warm amber tones` },
  // Genres équipe
  { id: "e_daily", group: "genres", title: "Daily stand-up", prompt: `${STYLE}, quick team standup meeting in office, green tones, standing circle` },
  { id: "e_avancement", group: "genres", title: "Point d'avancement", prompt: `${STYLE}, team progress review with kanban board, blue tones` },
  { id: "e_valid", group: "genres", title: "Validation rapide", prompt: `${STYLE}, team making quick decision with thumbs up gesture, violet accents` },
  { id: "e_reunion", group: "genres", title: "Réunion d'équipe", prompt: `${STYLE}, regular team meeting around conference table, blue professional atmosphere` },
  { id: "e_kickoff", group: "genres", title: "Kick-off de projet", prompt: `${STYLE}, project kickoff with team celebrating launch, blue energetic mood` },
  { id: "e_brainstorm", group: "genres", title: "Brainstorming d'équipe", prompt: `${STYLE}, team brainstorming with colorful sticky notes on wall, green creative energy` },
  { id: "e_retro", group: "genres", title: "Rétrospective", prompt: `${STYLE}, agile retrospective with team discussing improvements on whiteboard, green tones` },
  { id: "e_cadrage", group: "genres", title: "Atelier de cadrage", prompt: `${STYLE}, project scoping workshop with scope diagram on whiteboard, violet tones` },
  { id: "e_probleme", group: "genres", title: "Résolution de problème équipe", prompt: `${STYLE}, team root cause analysis with fishbone diagram, blue collaborative mood` },
  { id: "e_decision", group: "genres", title: "Atelier de décision", prompt: `${STYLE}, structured decision workshop with comparison matrix, violet tones` },
  { id: "e_parties", group: "genres", title: "Parties prenantes", prompt: `${STYLE}, stakeholder meeting with diverse participants around table, warm amber tones` },
  { id: "e_travail", group: "genres", title: "Atelier de travail", prompt: `${STYLE}, deep work session team producing deliverable together, green focused atmosphere` },
  // Genres atelier
  { id: "a_priorisation", group: "genres", title: "Priorisation collective", prompt: `${STYLE}, large group prioritization workshop with dot voting on wall, blue tones` },
  { id: "a_cocreation", group: "genres", title: "Co-création", prompt: `${STYLE}, co-creation workshop with groups building prototypes, warm amber collaborative mood` },
  { id: "a_ideation", group: "genres", title: "Idéation grande échelle", prompt: `${STYLE}, large scale ideation with multiple breakout tables, green energetic workshop` },
  { id: "a_designthink", group: "genres", title: "Design thinking", prompt: `${STYLE}, design thinking workshop with empathy maps and prototypes, violet human-centered mood` },
  { id: "a_hackathon", group: "genres", title: "Hackathon", prompt: `${STYLE}, hackathon with teams coding and prototyping intensely, warm amber competitive energy` },
  { id: "a_sprint", group: "genres", title: "Design sprint", prompt: `${STYLE}, design sprint workshop with sticky notes and prototypes on tables, blue collaborative energy` },
  { id: "a_worldcafe", group: "genres", title: "World café", prompt: `${STYLE}, world cafe facilitation with round tables and rotating conversations, violet community mood` },
  { id: "a_strategie", group: "genres", title: "Planification stratégique", prompt: `${STYLE}, strategic planning workshop with roadmap on large wall, blue executive atmosphere` },
  { id: "a_bootcamp", group: "genres", title: "Bootcamp pluri-jours", prompt: `${STYLE}, multi-day bootcamp with immersive learning space, green wide angle` },
  // Solo config — musique
  { id: "music_youtube", group: "solo", title: "YouTube", prompt: `${STYLE}, headphones on desk with music playlist on screen, red accent lighting, cozy focus` },
  { id: "music_spotify", group: "solo", title: "Spotify", prompt: `${STYLE}, person listening to music with headphones while working, emerald green ambient glow` },
  { id: "music_other", group: "solo", title: "Autre source", prompt: `${STYLE}, generic music streaming on laptop with headphones, neutral blue tones` },
  { id: "music_ambiance", group: "solo", title: "Ambiances", prompt: `${STYLE}, ambient soundscape visualization with nature and calm waves, violet peaceful mood` },
  { id: "music_none", group: "solo", title: "Aucune musique", prompt: `${STYLE}, silent focused workspace with no distractions, minimal slate gray tones` },
  // Solo config — ambiances
  { id: "amb_white", group: "solo", title: "Bruit blanc", prompt: `${STYLE}, abstract soft white noise waves visualization, calm minimal blue-gray` },
  { id: "amb_rain", group: "solo", title: "Pluie", prompt: `${STYLE}, rain on window with cozy indoor workspace, soft blue rainy atmosphere` },
  { id: "amb_waves", group: "solo", title: "Vagues", prompt: `${STYLE}, ocean waves on beach from window view, serene blue coastal mood` },
  { id: "amb_wind", group: "solo", title: "Vent", prompt: `${STYLE}, gentle wind through grass field landscape, airy green natural tones` },
  { id: "amb_forest", group: "solo", title: "Forêt", prompt: `${STYLE}, peaceful forest path with dappled sunlight, deep green nature atmosphere` },
  // Solo config — outils
  { id: "tool_chatgpt", group: "solo", title: "ChatGPT", prompt: `${STYLE}, AI assistant chat on laptop screen abstract representation, emerald green tech mood, no brand logos` },
  { id: "tool_claude", group: "solo", title: "Claude", prompt: `${STYLE}, AI writing assistant on screen abstract, warm orange tech atmosphere, no brand logos` },
  { id: "tool_canva", group: "solo", title: "Canva", prompt: `${STYLE}, graphic design canvas with colorful layouts on screen, violet creative mood, no brand logos` },
  { id: "tool_figma", group: "solo", title: "Figma", prompt: `${STYLE}, UI design wireframes on screen, rose pink design studio mood, no brand logos` },
  { id: "tool_gdocs", group: "solo", title: "Google Docs", prompt: `${STYLE}, collaborative document editing on laptop, blue productivity atmosphere, no brand logos` },
  { id: "tool_youtube", group: "solo", title: "YouTube outil", prompt: `${STYLE}, video learning on laptop screen, red accent educational mood, no brand logos` },
  { id: "tool_miro", group: "solo", title: "Miro", prompt: `${STYLE}, digital whiteboard with sticky notes on large screen, amber collaborative mood, no brand logos` },
  // Lancement
  { id: "launch_now", group: "launch", title: "Lancer maintenant", prompt: `${STYLE}, person pressing start button on session dashboard, blue energetic launch mood` },
  { id: "launch_schedule", group: "launch", title: "Programmer", prompt: `${STYLE}, calendar scheduling with future meeting planned, green organized atmosphere` },
  { id: "launch_simulate", group: "launch", title: "Simuler", prompt: `${STYLE}, rehearsal mode with person previewing meeting alone, violet thoughtful mood` },
  // Ordre du jour — types de blocs
  { id: "agenda_intro", group: "agenda", title: "Ouverture", prompt: `${STYLE}, facilitator welcoming small team at start of workshop, warm welcoming atmosphere, blue tones` },
  { id: "agenda_focus", group: "agenda", title: "Travail guidé", prompt: `${STYLE}, focused team working on facilitation method at table with sticky notes, sky blue productive mood` },
  { id: "agenda_pause", group: "agenda", title: "Pause", prompt: `${STYLE}, coffee break during workshop people relaxing chatting, warm amber cozy atmosphere` },
  { id: "agenda_synthese", group: "agenda", title: "Synthèse", prompt: `${STYLE}, team wrapping up session with action plan on whiteboard, emerald green decisive mood` },
  { id: "agenda_breakout", group: "agenda", title: "Sous-groupe", prompt: `${STYLE}, small breakout group discussion in corner of workshop room, violet collaborative energy` },
  { id: "agenda_pleniere", group: "agenda", title: "Plénière", prompt: `${STYLE}, plenary session large group sharing results in auditorium style room, indigo professional atmosphere` },
];

const args = process.argv.slice(2);
const skipExisting = args.includes("--skip-existing");
const groupFilter = args.find((a) => a.startsWith("--group="))?.split("=")[1];

async function findNewestFile(dir) {
  const files = await readdir(dir);
  const images = files.filter((f) => /\.(webp|png|jpe?g)$/i.test(f) && f !== `${dir}`);
  if (!images.length) return null;
  return images.sort().pop();
}

async function renameOutput(outDir, id) {
  const target = join(outDir, `${id}.webp`);
  if (existsSync(target)) return target;

  const newest = await findNewestFile(outDir);
  if (!newest || newest === `${id}.webp`) return existsSync(target) ? target : null;

  await rename(join(outDir, newest), target);
  return target;
}

async function generateOne(item) {
  const outDir = GROUP_DIRS[item.group];
  const target = join(outDir, `${item.id}.webp`);

  if (skipExisting && existsSync(target)) {
    console.log(`⊘ skip ${item.group}/${item.id} (exists)`);
    return;
  }

  const input = JSON.stringify({
    prompt: item.prompt,
    aspect_ratio: "4:3",
    resolution: "1K",
    output_format: "webp",
  });

  console.log(`→ ${item.group}/${item.id} (${item.title})`);
  execSync(
    `runcomfy run google/nano-banana-2/text-to-image --input '${input.replace(/'/g, "'\\''")}' --output-dir "${outDir}"`,
    { stdio: "inherit", cwd: ROOT },
  );
  await renameOutput(outDir, item.id);
  console.log(`  ✓ ${item.id}.webp`);
}

async function writeMapping() {
  const mapping = Object.fromEntries(
    ITEMS.map((item) => [item.id, `/wizard/${item.group}/${item.id}.webp`]),
  );
  await writeFile(
    join(ROOT, "src", "lib", "wizard", "wizard-images.generated.json"),
    `${JSON.stringify(mapping, null, 2)}\n`,
  );
}

async function writeAvailable() {
  const available = Object.fromEntries(
    ITEMS.filter((item) => existsSync(join(GROUP_DIRS[item.group], `${item.id}.webp`))).map((item) => [
      item.id,
      true,
    ]),
  );
  await writeFile(
    join(ROOT, "src", "lib", "wizard", "wizard-images.available.json"),
    `${JSON.stringify(available, null, 2)}\n`,
  );
}

async function main() {
  for (const dir of Object.values(GROUP_DIRS)) {
    await mkdir(dir, { recursive: true });
  }

  const items = groupFilter ? ITEMS.filter((i) => i.group === groupFilter) : ITEMS;

  for (const item of items) {
    await generateOne(item);
  }

  await writeMapping();
  await writeAvailable();
  console.log(`\nTerminé — ${items.length} item(s), mapping + available écrits`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
