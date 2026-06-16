import wizardImages from "./wizard-images.generated.json";
import wizardAvailable from "./wizard-images.available.json";

export type WizardImageId = keyof typeof wizardImages;

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

const DEFAULT_ILLUSTRATION = U("photo-1552664730-d307ca884978");

/** Illustrations éditoriales — remplaçables via scripts/generate-wizard-images.mjs (Nano Banana 2). */
export const WIZARD_ILLUSTRATIONS: Record<string, string> = {
  academique: U("photo-1523240795612-9a054b0db644"),
  creation: U("photo-1513364776144-60967b0f800f"),
  entrepreneurial: U("photo-1559136555-9303baea8ebd"),
  pro: U("photo-1600880292203-757bb62b4baf"),
  solo: U("photo-1507003211169-0a1dd7228f2d"),
  equipe: U("photo-1522071820081-009f0129c71c"),
  atelier: U("photo-1542744173-8e7e53415bb0"),
  // Genres solo
  s_capture: U("photo-1517245386807-bb43f82c33c4"),
  s_clarifier: U("photo-1454165804606-c3d57bc86b40"),
  s_brainstorm: U("photo-1504384308090-c894fdcc538d"),
  s_structurer: U("photo-1481627834876-b7833e8f5570"),
  s_probleme: U("photo-1551288049-bebda4e38f71"),
  s_ecriture: U("photo-1507003211169-0a1dd7228f2d"),
  s_reflexion: U("photo-1507003211169-0a1dd7228f2d"),
  s_projet: U("photo-1484480974693-6af0152b0e0d"),
  // Genres équipe
  e_daily: U("photo-1542744173-8e7e53415bb0"),
  e_avancement: U("photo-1611224923853-80b023f02d71"),
  e_valid: U("photo-1529156069898-49953e39b3ac"),
  e_reunion: U("photo-1600880292203-757bb62b4baf"),
  e_kickoff: U("photo-1559136555-9303baea8ebd"),
  e_brainstorm: U("photo-1522202176988-66273c2fd55f"),
  e_retro: U("photo-1552664730-d307ca884978"),
  e_cadrage: U("photo-1521737711862-e3b97375f902"),
  e_probleme: U("photo-1504868584819-f8e8b4b6d7e3"),
  e_decision: U("photo-1553877522-43269d4ea984"),
  e_parties: U("photo-1522071820081-009f0129c71c"),
  e_travail: U("photo-1519389950473-47ba0277781c"),
  // Genres atelier
  a_priorisation: U("photo-1551288049-bebda4e38f71"),
  a_cocreation: U("photo-1529156069898-49953e39b3ac"),
  a_ideation: U("photo-1522202176988-66273c2fd55f"),
  a_designthink: U("photo-1573497019940-1c28c88b4f3e"),
  a_hackathon: U("photo-1504384308090-c894fdcc538d"),
  a_sprint: U("photo-1551434678-e076c223a692"),
  a_worldcafe: U("photo-1521737711862-e3b97375f902"),
  a_strategie: U("photo-1460925895917-afdab827c52f"),
  a_bootcamp: U("photo-1523240795612-9a054b0db644"),
  // Blocs ordre du jour (Nano Banana groupe agenda)
  agenda_intro: U("photo-1552664730-d307ca884978"),
  agenda_focus: U("photo-1519389950473-47ba0277781c"),
  agenda_pause: U("photo-1495474472287-4d71bcdd2085"),
  agenda_synthese: U("photo-1553877522-43269d4ea984"),
  agenda_breakout: U("photo-1521737711862-e3b97375f902"),
  agenda_pleniere: U("photo-1542744173-8e7e53415bb0"),
  // Lancement wizard
  launch_now: U("photo-1552664730-d307ca884978"),
  launch_schedule: U("photo-1611224923853-80b023f02d71"),
  launch_simulate: U("photo-1573497019940-1c28c88b4f3e"),
};

export function wizardImageSrc(id: string): string | undefined {
  return id in wizardImages ? wizardImages[id as WizardImageId] : undefined;
}

function hasLocalWizardImage(id: string): boolean {
  return Boolean(wizardAvailable[id as keyof typeof wizardAvailable]);
}

/** Nano Banana local si généré, sinon Unsplash (évite un 404 sur des .webp absents). */
export function getWizardIllustration(id: string): string {
  const local = wizardImageSrc(id);
  if (local && hasLocalWizardImage(id)) return local;
  return WIZARD_ILLUSTRATIONS[id] ?? DEFAULT_ILLUSTRATION;
}

export function getWizardIllustrationFallback(id: string): string {
  if (hasLocalWizardImage(id) && wizardImageSrc(id)) {
    return WIZARD_ILLUSTRATIONS[id] ?? DEFAULT_ILLUSTRATION;
  }
  return DEFAULT_ILLUSTRATION;
}
