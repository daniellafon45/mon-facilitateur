/** Illustrations par méthode — remplaçables via scripts/generate-method-illustrations.mjs (Nano Banana 2). */
const U = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}`;

export const METHOD_ILLUSTRATIONS: Record<string, string> = {
  qqoqcp: U("photo-1454165804606-c3d57bc86b40"),
  "5-pourquoi": U("photo-1504868584819-f8e8b4b6d7e3"),
  "objectifs-smart": U("photo-1552664730-d307ca884978"),
  "clarification-du-mandat": U("photo-1521737711862-e3b97375f902"),
  "analyse-des-parties-prenantes": U("photo-1522071820081-009f0129c71c"),
  "matrice-pouvoir-interet": U("photo-1553877522-43269d4ea984"),
  ishikawa: U("photo-1551288049-bebda4e38f71"),
  bono: U("photo-1517245386807-bb43f82c33c4"),
  swot: U("photo-1460925895917-afdab827c52f"),
  pestel: U("photo-1451187580459-43490279c0fa"),
  "analyse-des-risques": U("photo-1563986768609-322da13575f3"),
  "benchmark-concurrentiel": U("photo-1556761175-b413da4baf72"),
  persona: U("photo-1573496359142-b8d87734a5a2"),
  "carte-d-empathie": U("photo-1573497019940-1c28c88b4f3e"),
  "parcours-utilisateur": U("photo-1551434678-e076c223a692"),
  brainstorming: U("photo-1522202176988-66273c2fd55f"),
  brainwriting: U("photo-1519389950473-47ba0277781c"),
  scamper: U("photo-1504384308090-c894fdcc538d"),
  bmc: U("photo-1556761175-5973dc0f32e7"),
  "lean-canvas": U("photo-1553877522-43269d4ea984"),
  "value-proposition-canvas": U("photo-1559136555-9303baea8ebd"),
  raci: U("photo-1600880292203-757bb62b4baf"),
  roles: U("photo-1529156069898-49953e39b3ac"),
  charter: U("photo-1521791136064-7986c2920216"),
  commplan: U("photo-1557804506-669a67965ba0"),
  "matrice-impact-effort": U("photo-1551288049-bebda4e38f71"),
  moscow: U("photo-1507679799987-c73779587cdf"),
  rice: U("photo-1553877522-43269d4ea984"),
  "plan-d-action": U("photo-1484480974693-6af0152b0e0d"),
  kanban: U("photo-1611224923853-80b023f02d71"),
  "scrum-sprint-board": U("photo-1542744173-8e7e53415bb0"),
  "gantt-simplifie": U("photo-1507925921958-8a75962421fd"),
  tracabilite: U("photo-1454165804606-c3d57bc86b40"),
  "start-stop-continue": U("photo-1517245386807-bb43f82c33c4"),
  "retrospective-4l": U("photo-1552664730-d307ca884978"),
  vote: U("photo-1529156069898-49953e39b3ac"),
  desaccord: U("photo-1573497019940-1c28c88b4f3e"),
  reflexion: U("photo-1519389950473-47ba0277781c"),
  probleme: U("photo-1504868584819-f8e8b4b6d7e3"),
  minuteur: U("photo-1507925921958-8a75962421fd"),
  parking: U("photo-1556761175-b413da4baf72"),
  "tableau-blanc": U("photo-1557804506-669a67965ba0"),
};

const FAMILY_FALLBACK: Record<string, string> = {
  cadrer: U("photo-1454165804606-c3d57bc86b40"),
  analyser: U("photo-1460925895917-afdab827c52f"),
  generer: U("photo-1522202176988-66273c2fd55f"),
  modeliser: U("photo-1556761175-5973dc0f32e7"),
  prioriser: U("photo-1551288049-bebda4e38f71"),
  planifier: U("photo-1484480974693-6af0152b0e0d"),
  retro: U("photo-1517245386807-bb43f82c33c4"),
  seance: U("photo-1557804506-669a67965ba0"),
};

export function getMethodIllustration(methodId: string, familyId?: string) {
  return (
    METHOD_ILLUSTRATIONS[methodId] ??
    (familyId ? FAMILY_FALLBACK[familyId] : undefined) ??
    U("photo-1552664730-d307ca884978")
  );
}

export function localMethodIllustrationPath(methodId: string) {
  return `/methods/illustrations/${methodId}.webp`;
}
