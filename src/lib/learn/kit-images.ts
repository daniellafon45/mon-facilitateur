/** Illustrations réalistes des kits — remplaçables via scripts/generate-kit-illustrations.mjs */
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=85&w=${w}`;

export const KIT_ILLUSTRATIONS: Record<string, string> = {
  marshmallow: U("photo-1522202176988-66273c2fd55f"),
  "tour-papier": U("photo-1454165804606-c3d57bc86b40"),
  pont: U("photo-1513833450684-92a0b9cde02d"),
  "egg-drop": U("photo-1582729478100-279ccf2cb9c1"),
  avion: U("photo-1436491865339-41c8a1a6e07d"),
  trombones: U("photo-1556761175-5973dc0f32e7"),
  lego: U("photo-1587652660291-39fcc772a39b"),
  "prototype-carton": U("photo-1607082350897-f11a0c0eba2a"),
  instructions: U("photo-1573497019940-1c28c88b4f3e"),
  publicite: U("photo-1556761175-b413da4baf72"),
  negociation: U("photo-1521791136064-7986c2920216"),
  survie: U("photo-1478131143081-5c55854d79c4"),
  budget: U("photo-1460925895917-afdab827c52f"),
  "ville-durable": U("photo-1449845347150-88581f7827da"),
  production: U("photo-1581091226825-a6a2a5aee158"),
  escape: U("photo-1551288049-bebda4e38f71"),
};

const CAT_FALLBACK: Record<string, string> = {
  construction: U("photo-1504384308090-c894fdcc538d"),
  communication: U("photo-1517245386807-bb43f82c33c4"),
  strategie: U("photo-1551288049-bebda4e38f71"),
};

export function getKitIllustration(kitId: string, cat?: string) {
  return (
    KIT_ILLUSTRATIONS[kitId] ??
    (cat ? CAT_FALLBACK[cat] : undefined) ??
    U("photo-1552664730-d307ca884978")
  );
}
