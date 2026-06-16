import type { MeetingAgendaBlock, SessionMode } from "@/types/facilitation";
import { METHOD_BY_ID } from "@/lib/methods/catalog";

let blockId = 1;
function block(
  title: string,
  min: number,
  method = "—",
  importance: MeetingAgendaBlock["importance"] = "normale",
  kind?: MeetingAgendaBlock["kind"],
): MeetingAgendaBlock {
  return { id: `ag${blockId++}`, title, min, method, importance, kind, docs: [] };
}

const PHASES: Record<string, string[]> = {
  brainstorm: ["Cadrage du sujet", "Génération d'idées", "Regroupement", "Priorisation"],
  ishikawa: ["Définir l'effet observé", "Cartographier les causes", "Prioriser les leviers"],
  bmc: ["Proposition de valeur", "Clients & canaux", "Activités & ressources", "Revenus & coûts"],
  bono: ["Bleu cadrage", "Blanc faits", "Rouge ressenti", "Jaune bénéfices", "Noir risques", "Vert idées"],
};

function phasesFor(methodId: string) {
  return PHASES[methodId] ?? ["Travail guidé", "Approfondissement", "Synthèse"];
}

function distributeMinutes(blocks: MeetingAgendaBlock[], targetMin: number) {
  const fixed = blocks.reduce((s, b) => s + (b.min || 0), 0);
  const flex = blocks.filter((b) => !b.min);
  if (flex.length === 0) return blocks;
  const remaining = Math.max(0, targetMin - fixed);
  const per = Math.max(5, Math.round(remaining / flex.length / 5) * 5);
  return blocks.map((b) => (b.min ? b : { ...b, min: per }));
}

function pomodoroBlocks(
  workPhases: string[],
  mTitle: string,
  targetMin: number,
): MeetingAgendaBlock[] {
  blockId = 1;
  const blocks: MeetingAgendaBlock[] = [block("Mise en route", 5, "—", "normale", "intro")];
  const focusMin = 25;
  const pauseMin = 5;
  let used = 5;
  for (const phase of workPhases.slice(0, 4)) {
    if (used + focusMin + pauseMin > targetMin + 15) break;
    blocks.push(block(`Focus · ${phase}`, focusMin, mTitle, "haute", "focus"));
    used += focusMin;
    if (used + pauseMin <= targetMin + 10) {
      blocks.push(block("Pause", pauseMin, "—", "basse", "pause"));
      used += pauseMin;
    }
  }
  blocks.push(block("Synthèse perso", Math.max(5, Math.min(15, targetMin - used)), "—", "normale", "synthèse"));
  return blocks;
}

export function generateAgendaPlan(
  mode: SessionMode,
  methodIds: string[],
  targetMin = 90,
  options?: { pomodoro?: boolean; condensed?: boolean },
): MeetingAgendaBlock[] {
  blockId = 1;
  const primaryId = methodIds[0] ?? "brainstorm";
  const mTitle = METHOD_BY_ID[primaryId]?.title ?? "Méthode";
  const ph = phasesFor(primaryId);
  const factor = options?.condensed ? 0.75 : 1;
  const target = Math.round(targetMin * factor);

  if (mode === "solo" && options?.pomodoro) {
    return distributeMinutes(pomodoroBlocks(ph, mTitle, target), target);
  }

  const blocks: MeetingAgendaBlock[] = [];

  if (mode === "solo") {
    blocks.push(block("Mise en route", 10));
    ph.slice(0, 3).forEach((p) => blocks.push(block(p, 0, mTitle, "haute", "focus")));
    blocks.push(block("Synthèse perso", 10, "—", "normale", "synthèse"));
  } else if (mode === "atelier") {
    blocks.push(block("Tour de table", 5, "—", "normale", "intro"));
    blocks.push(block("Ouverture en plénière", 10, "—", "normale", "plénière"));
    ph.slice(0, 2).forEach((p) => {
      blocks.push(block(p, 0, mTitle, "haute", "breakout"));
      blocks.push(block("Restitution", 10, "—", "normale", "plénière"));
    });
    blocks.push(block("Synthèse & vote", 15, "—", "haute", "synthèse"));
  } else {
    blocks.push(block("Accueil & objectifs", 10, "—", "normale", "intro"));
    ph.forEach((p) => blocks.push(block(p, 0, mTitle, "haute", "focus")));
    blocks.push(block("Priorisation / décision", 15, "—", "haute"));
    blocks.push(block("Synthèse & prochaines étapes", 10, "—", "normale", "synthèse"));
  }

  return distributeMinutes(blocks, target);
}

export function upcomingAgendaFromPlan(plan: MeetingAgendaBlock[] | undefined) {
  if (!plan?.length) {
    return [
      { t: "Accueil & objectifs", dur: "10 min" },
      { t: "Travail guidé (méthode)", dur: "40 min" },
      { t: "Priorisation / décisions", dur: "20 min" },
      { t: "Synthèse & prochaines étapes", dur: "10 min" },
    ];
  }
  return plan.map((b) => ({
    t: b.title,
    dur: b.min ? `${b.min} min` : "—",
  }));
}

export function agendaTotalMinutes(plan: MeetingAgendaBlock[]) {
  return plan.reduce((s, b) => s + (b.min || 0), 0);
}

export function fmtAgendaDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}
