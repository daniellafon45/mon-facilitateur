/**
 * Génère les illustrations Nano Banana 2 pour chaque méthode.
 *
 * Prérequis :
 *   npm i -g @runcomfy/cli
 *   runcomfy login   OU   RUNCOMFY_TOKEN dans .env.local
 *
 * Usage :
 *   node scripts/generate-method-illustrations.mjs
 *   node scripts/generate-method-illustrations.mjs --only brainstorming,swot
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "methods", "illustrations");

const METHODS = [
  { id: "qqoqcp", title: "QQOQCP", theme: "facilitation workshop questions whiteboard" },
  { id: "5-pourquoi", title: "5 Pourquoi", theme: "root cause analysis team discussion" },
  { id: "objectifs-smart", title: "Objectifs SMART", theme: "goal setting sticky notes planning" },
  { id: "clarification-du-mandat", title: "Clarification du mandat", theme: "project charter briefing meeting" },
  { id: "analyse-des-parties-prenantes", title: "Parties prenantes", theme: "stakeholder mapping workshop" },
  { id: "matrice-pouvoir-interet", title: "Matrice pouvoir intérêt", theme: "power interest matrix diagram" },
  { id: "ishikawa", title: "Ishikawa", theme: "fishbone cause effect diagram" },
  { id: "bono", title: "6 chapeaux de Bono", theme: "six thinking hats colorful facilitation" },
  { id: "swot", title: "SWOT", theme: "swot analysis four quadrants board" },
  { id: "pestel", title: "PESTEL", theme: "macro environment analysis infographic" },
  { id: "analyse-des-risques", title: "Analyse des risques", theme: "risk matrix dashboard minimal" },
  { id: "benchmark-concurrentiel", title: "Benchmark", theme: "competitive comparison charts" },
  { id: "persona", title: "Persona", theme: "user persona profile card illustration" },
  { id: "carte-d-empathie", title: "Carte d'empathie", theme: "empathy map design thinking" },
  { id: "parcours-utilisateur", title: "Parcours utilisateur", theme: "customer journey map steps" },
  { id: "brainstorming", title: "Brainstorming", theme: "creative ideation sticky notes wall" },
  { id: "brainwriting", title: "Brainwriting", theme: "silent ideation cards rotation" },
  { id: "scamper", title: "SCAMPER", theme: "innovation lightbulb creative workshop" },
  { id: "bmc", title: "Business Model Canvas", theme: "business model canvas nine blocks" },
  { id: "lean-canvas", title: "Lean Canvas", theme: "lean startup canvas template" },
  { id: "value-proposition-canvas", title: "Value Proposition", theme: "value proposition canvas fit" },
  { id: "raci", title: "Matrice RACI", theme: "raci responsibility matrix table" },
  { id: "roles", title: "Matrice des rôles", theme: "team roles assignment workshop" },
  { id: "charter", title: "Charte d'équipe", theme: "team charter collaboration agreement" },
  { id: "commplan", title: "Plan de communication", theme: "communication plan timeline" },
  { id: "matrice-impact-effort", title: "Impact effort", theme: "impact effort prioritization matrix" },
  { id: "moscow", title: "MoSCoW", theme: "prioritization must should could labels" },
  { id: "rice", title: "RICE", theme: "prioritization scoring framework" },
  { id: "plan-d-action", title: "Plan d'action", theme: "action plan checklist tasks" },
  { id: "kanban", title: "Kanban", theme: "kanban board columns cards" },
  { id: "scrum-sprint-board", title: "Scrum Sprint", theme: "scrum sprint board agile" },
  { id: "gantt-simplifie", title: "Gantt", theme: "gantt chart project timeline" },
  { id: "tracabilite", title: "Suivi décisions", theme: "decision traceability links diagram" },
  { id: "start-stop-continue", title: "Start Stop Continue", theme: "retrospective three columns" },
  { id: "retrospective-4l", title: "Rétro 4L", theme: "retrospective four quadrants liked learned" },
  { id: "vote", title: "Vote", theme: "live voting dots poll facilitation" },
  { id: "desaccord", title: "Désaccord", theme: "consensus decision facilitation" },
  { id: "reflexion", title: "Réflexion", theme: "deep thinking questions workshop" },
  { id: "probleme", title: "Résoudre problème", theme: "problem solving framework sticky notes" },
  { id: "minuteur", title: "Minuteur", theme: "timer pomodoro facilitation clock" },
  { id: "parking", title: "Parking lot", theme: "parking lot ideas capture board" },
  { id: "tableau-blanc", title: "Tableau blanc", theme: "digital whiteboard collaboration canvas" },
];

function buildPrompt({ title, theme }) {
  return [
    `Minimal editorial illustration for a facilitation method card titled "${title}".`,
    `Scene: ${theme}.`,
    "Soft paper texture, muted professional palette, no text in image,",
    "clean flat vector style, warm studio lighting, 16:9 composition,",
    "suitable as a SaaS product card header.",
  ].join(" ");
}

async function generateOne(method) {
  const prompt = buildPrompt(method);
  const input = JSON.stringify({
    prompt,
    aspect_ratio: "16:9",
    resolution: "1K",
    output_format: "webp",
  });

  console.log(`→ ${method.id} …`);
  execSync(
    `runcomfy run google/nano-banana-2/text-to-image --input '${input.replace(/'/g, "'\\''")}' --output-dir "${OUT_DIR}"`,
    { stdio: "inherit", cwd: ROOT },
  );

  // RunComfy names output files; rename latest webp to method id
  // User may need to rename manually if CLI uses random names — document in README comment
  console.log(`  ✓ sortie dans ${OUT_DIR} — renommer en ${method.id}.webp si besoin`);
}

async function main() {
  const onlyArg = process.argv.find((a) => a.startsWith("--only"));
  const only = onlyArg
    ? new Set(onlyArg.replace("--only", "").replace("=", "").split(",").map((s) => s.trim()))
    : null;

  const list = only ? METHODS.filter((m) => only.has(m.id)) : METHODS;
  await mkdir(OUT_DIR, { recursive: true });

  for (const method of list) {
    await generateOne(method);
  }

  const mapping = Object.fromEntries(
    list.map((m) => [m.id, `/methods/illustrations/${m.id}.webp`]),
  );
  await writeFile(
    join(ROOT, "src", "lib", "methods", "method-images.generated.json"),
    JSON.stringify(mapping, null, 2),
  );
  console.log(`\nTerminé — ${list.length} illustration(s). Mettez à jour method-images.ts si besoin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
