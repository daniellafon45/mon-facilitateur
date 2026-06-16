/** Illustrations réalistes des parcours — remplaçables via scripts/generate-parcours-illustrations.mjs */
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=85&w=${w}`;

export const PARCOURS_ILLUSTRATIONS: Record<string, string> = {
  p1: U("photo-1522202176988-66273c2fd55f"),
  p2: U("photo-1486406146926-c627a92ad1ab"),
  p3: U("photo-1522071820081-009f0129c71c"),
  p4: U("photo-1551288049-bebda4e38f71"),
  p5: U("photo-1553877522-43269d4ea984"),
  p6: U("photo-1517245386807-bb43f82c33c4"),
};

const THEME_FALLBACK: Record<string, string> = {
  creativite: U("photo-1504384308090-c894fdcc538d"),
  innovation: U("photo-1559136555-9303baea8ebd"),
  design: U("photo-1573496359142-b8d87734a5a2"),
  facilitation: U("photo-1552664730-d307ca884978"),
  resolution: U("photo-1504868584819-f8e8b4b6d7e3"),
  strategie: U("photo-1454165804606-c3d57bc86b40"),
  collaboration: U("photo-1529156069898-49953e39b3ac"),
  leadership: U("photo-1600880292203-757bb62b4baf"),
};

export function getParcoursIllustration(parcoursId: string, theme?: string) {
  return (
    PARCOURS_ILLUSTRATIONS[parcoursId] ??
    (theme ? THEME_FALLBACK[theme] : undefined) ??
    U("photo-1552664730-d307ca884978")
  );
}

export const LEARN_METHOD_ILLUSTRATIONS: Record<string, string> = {
  brainstorming: U("photo-1522202176988-66273c2fd55f"),
  ishikawa: U("photo-1551288049-bebda4e38f71"),
  "5pourquoi": U("photo-1504868584819-f8e8b4b6d7e3"),
  "carte-conceptuelle": U("photo-1557804506-669a67965ba0"),
  "schema-fonctionnel": U("photo-1556761175-5973dc0f32e7"),
  "schema-logique": U("photo-1460925895917-afdab827c52f"),
  "six-chapeaux": U("photo-1517245386807-bb43f82c33c4"),
  bmc: U("photo-1556761175-5973dc0f32e7"),
  raci: U("photo-1600880292203-757bb62b4baf"),
  gantt: U("photo-1507925921958-8a75962421fd"),
  risques: U("photo-1563986768609-322da13575f3"),
};

export function getLearnMethodIllustration(methodId: string, theme?: string) {
  return (
    LEARN_METHOD_ILLUSTRATIONS[methodId] ??
    (theme ? THEME_FALLBACK[theme] : undefined) ??
    U("photo-1519389950473-47ba0277781c")
  );
}

/** Illustrations du panneau Accès rapide (ressources par catégorie). */
export const RESOURCE_CAT_ILLUSTRATIONS: Record<string, string> = {
  creativite: U("photo-1522202176988-66273c2fd55f"),
  innovation: U("photo-1553877522-43269d4ea984"),
  outils: U("photo-1454165804606-c3d57bc86b40"),
  guides: U("photo-1517245386807-bb43f82c33c4"),
};

export function getResourceCatIllustration(catId: string) {
  return RESOURCE_CAT_ILLUSTRATIONS[catId] ?? THEME_FALLBACK[catId] ?? U("photo-1552664730-d307ca884978");
}

/** Illustrations des nouveautés (panneau latéral). */
export function getLearnNewsIllustration(item: {
  res?: string;
  method?: string;
  color?: string;
}) {
  if (item.method) return getLearnMethodIllustration(item.method);
  if (item.res?.includes("créativité") || item.res?.includes("creativite")) {
    return U("photo-1504384308090-c894fdcc538d");
  }
  if (item.res?.includes("templates") || item.res?.includes("atelier")) {
    return U("photo-1556761175-5973dc0f32e7");
  }
  return U("photo-1454165804606-c3d57bc86b40");
}
