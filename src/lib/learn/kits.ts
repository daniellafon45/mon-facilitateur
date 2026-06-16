export interface ActivityKit {
  id: string;
  name: string;
  color: string;
  icon: string;
  cat: string;
  price: number;
  dur: string;
  vid?: string;
  objective: string;
  about: string;
  skills: string[];
  items: string[];
}

export const KIT_DELIVERY_FEE = 14.99;
export const KIT_FACILITATOR_FEE = 199;
export const KIT_TPS = 0.05;
export const KIT_TVQ = 0.09975;
export const KIT_FORMAT = "Conçu pour 5 équipes · 20 à 30 participants";

export const KIT_BASE_INCLUDES = [
  { label: "Boîte My Facilitator", icon: "Package" },
  { label: "Guide animateur", icon: "BookOpen" },
  { label: "Guide participant", icon: "Document" },
  { label: "Fiches de pointage", icon: "ClipboardList" },
  { label: "Certificat équipe gagnante", icon: "Star" },
  { label: "Chronomètre MFT", icon: "Clock" },
  { label: "Sifflet MFT", icon: "Bolt" },
  { label: "Ruban à mesurer MFT", icon: "Sliders" },
  { label: "QR code vers la version numérique", icon: "Link" },
];

export const KIT_CATS = [
  { id: "construction", label: "Prototypage & construction" },
  { id: "communication", label: "Communication & influence" },
  { id: "strategie", label: "Stratégie & décision" },
];

export const KIT_CAT_LABEL: Record<string, string> = Object.fromEntries(
  KIT_CATS.map((c) => [c.id, c.label]),
);

export const KITS: ActivityKit[] = [
  { id: "marshmallow", name: "Marshmallow Challenge", color: "amber", icon: "Building", cat: "construction", price: 149, dur: "18 min", vid: "H0_yKBitO8M", objective: "Construire la plus haute tour autoportante.", about: "Un classique du team-building : avec des spaghettis, du ruban et une guimauve au sommet, chaque équipe vise la structure la plus haute.", skills: ["Créativité", "Collaboration", "Prototypage rapide", "Leadership"], items: ["100 spaghettis", "5 rubans adhésifs", "5 ficelles", "25 guimauves"] },
  { id: "tour-papier", name: "Tour de papier", color: "blue", icon: "Document", cat: "construction", price: 129, dur: "20 min", vid: "lk41Fe1WK6Q", objective: "Construire la plus haute structure stable.", about: "Quelques feuilles, du ruban et de l'imagination : chaque équipe conçoit la tour la plus haute et la plus stable.", skills: ["Innovation", "Gestion des ressources", "Travail d'équipe"], items: ["250 feuilles de papier", "5 rubans adhésifs", "5 paires de ciseaux", "5 règles", "Cartes contraintes"] },
  { id: "pont", name: "Pont collaboratif", color: "green", icon: "Handshake", cat: "construction", price: 179, dur: "30 min", vid: "o0vjLIIbdNQ", objective: "Construire un pont supportant une charge.", about: "Chaque équipe conçoit un pont capable de supporter une charge réelle.", skills: ["Ingénierie", "Planification", "Collaboration"], items: ["300 bâtonnets de bois", "Ficelle", "Ruban adhésif", "Poids de test", "Cartes contraintes"] },
  { id: "egg-drop", name: "Défi œuf protégé", color: "amber", icon: "Shield", cat: "construction", price: 169, dur: "30 min", vid: "IYCY6s-GmQA", objective: "Protéger un œuf lors d'une chute.", about: "Concevoir, tester, recommencer : chaque équipe imagine un dispositif pour qu'un œuf survive à une chute.", skills: ["Design", "Innovation", "Gestion du risque"], items: ["Œufs factices réutilisables", "Pailles", "Coton", "Élastiques", "Ruban adhésif", "Cartes contraintes"] },
  { id: "avion", name: "Avion en papier", color: "blue", icon: "Plane", cat: "construction", price: 99, dur: "20 min", objective: "Créer l'avion le plus performant.", about: "Distance, précision, style : chaque équipe expérimente, mesure et améliore son modèle.", skills: ["Expérimentation", "Analyse", "Amélioration continue"], items: ["Papiers spéciaux", "Trombones", "Cibles de précision", "Cartes défis"] },
  { id: "trombones", name: "Chaîne de trombones", color: "violet", icon: "Link", cat: "construction", price: 99, dur: "20 min", objective: "Créer la plus longue structure.", about: "Une contrainte simple, mille trombones : les équipes optimisent leur méthode.", skills: ["Optimisation", "Stratégie", "Collaboration"], items: ["1 000 trombones", "Ficelle", "Cartes contraintes", "Fiches de calcul"] },
  { id: "lego", name: "Défi Lego", color: "amber", icon: "Puzzle", cat: "construction", price: 249, dur: "40 min", objective: "Concevoir une solution à un problème donné.", about: "Brique par brique, chaque équipe matérialise une réponse à un problème imposé.", skills: ["Design Thinking", "Créativité", "Communication"], items: ["500 blocs Lego", "Cartes défis", "Cartes rôles", "Cartes contraintes"] },
  { id: "prototype-carton", name: "Prototype carton", color: "green", icon: "Package", cat: "construction", price: 179, dur: "35 min", objective: "Créer un prototype physique.", about: "Du carton et quelques attaches suffisent à donner forme à une idée.", skills: ["Innovation", "Design", "Prototypage"], items: ["Carton", "Attaches parisiennes", "Pailles", "Ruban adhésif", "Marqueurs"] },
  { id: "instructions", name: "Instructions impossibles", color: "violet", icon: "ChatBubble", cat: "communication", price: 119, dur: "25 min", objective: "Reproduire une image uniquement à partir d'instructions verbales.", about: "Sans rien montrer, il faut tout décrire : un exercice redoutable d'écoute et de clarté.", skills: ["Communication", "Écoute", "Clarté"], items: ["Cartes illustrations", "Cahiers participants", "Crayons", "Cartes rôles"] },
  { id: "publicite", name: "Publicité express", color: "amber", icon: "Star", cat: "communication", price: 119, dur: "20 min", objective: "Créer une campagne publicitaire en 20 minutes.", about: "Un produit, un public, un chrono : les équipes conçoivent puis pitchent une campagne.", skills: ["Marketing", "Créativité", "Présentation"], items: ["Cartes produits", "Cartes clients", "Post-it", "Feutres", "Canevas de pitch"] },
  { id: "negociation", name: "Négociation", color: "blue", icon: "Handshake", cat: "communication", price: 149, dur: "30 min", objective: "Conclure un accord gagnant.", about: "Des rôles, des intérêts cachés et un objectif commun : conclure.", skills: ["Négociation", "Communication", "Influence"], items: ["Cartes rôles", "Cartes objectifs secrets", "Jetons de valeur", "Contrats"] },
  { id: "survie", name: "Mission de survie", color: "green", icon: "Map", cat: "strategie", price: 129, dur: "30 min", objective: "Choisir les meilleures ressources pour survivre.", about: "Face à un scénario extrême, chaque équipe hiérarchise, débat et défend ses choix.", skills: ["Priorisation", "Consensus", "Argumentation"], items: ["Cartes objets", "Cartes scénarios", "Cartes événements", "Fiches de classement"] },
  { id: "budget", name: "Budget impossible", color: "amber", icon: "Scale", cat: "strategie", price: 149, dur: "40 min", objective: "Réaliser un projet avec un budget limité.", about: "Des moyens comptés, des imprévus, des arbitrages : les équipes pilotent un projet sous contrainte.", skills: ["Finance", "Gestion de projet", "Arbitrage"], items: ["Billets fictifs", "Cartes dépenses", "Cartes revenus", "Cartes imprévus"] },
  { id: "ville-durable", name: "Ville durable", color: "green", icon: "Leaf", cat: "strategie", price: 249, dur: "45 min", objective: "Construire une ville équilibrée.", about: "Économie, environnement, société : chaque équipe aménage une ville en arbitrant entre des objectifs concurrents.", skills: ["Développement durable", "Planification", "Décision collective"], items: ["Tuiles bâtiments", "Cartes ressources", "Cartes événements", "Plateau de jeu"] },
  { id: "production", name: "Chaîne de production", color: "blue", icon: "Sliders", cat: "strategie", price: 199, dur: "35 min", objective: "Produire le maximum d'unités conformes.", about: "Une mini-usine sur table : les équipes organisent leur chaîne et améliorent leur cadence.", skills: ["Lean", "Amélioration continue", "Gestion opérationnelle"], items: ["Cartes commandes", "Étiquettes qualité", "Matériel de fabrication papier", "Cartes imprévus"] },
  { id: "escape", name: "Mini Escape Game", color: "violet", icon: "Key", cat: "strategie", price: 199, dur: "45 min", objective: "Résoudre une enquête collaborative.", about: "Indices, suspects et cadenas : chaque équipe mène l'enquête sous pression.", skills: ["Résolution de problème", "Collaboration", "Pensée critique"], items: ["Enveloppes indices", "Cartes suspects", "Codes", "Cadenas réutilisables"] },
];

export const KIT_BY_ID: Record<string, ActivityKit> = Object.fromEntries(KITS.map((k) => [k.id, k]));

export function kitMoney(n: number) {
  return `${n.toFixed(2).replace(".", ",")} $`;
}

export function kitMoney0(n: number) {
  return `${Math.round(n)} $`;
}

export function kitZone(pcRaw: string): "invalid" | "in" | "out" {
  const pc = (pcRaw || "").toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]\d[A-Z]/.test(pc)) return "invalid";
  if (pc[0] === "H") return "in";
  if (/^J(3|4|5|7)/.test(pc)) return "in";
  return "out";
}

export function kitQuote(kit: ActivityKit, qty: number, withFacilitator: boolean) {
  const n = Math.max(1, qty | 0);
  const kits = kit.price * n;
  const facil = withFacilitator ? KIT_FACILITATOR_FEE : 0;
  const beforeTax = kits + facil + KIT_DELIVERY_FEE;
  const tps = beforeTax * KIT_TPS;
  const tvq = beforeTax * KIT_TVQ;
  const total = beforeTax + tps + tvq;
  return { qty: n, kits, facil, delivery: KIT_DELIVERY_FEE, tps, tvq, total };
}

export function kitDates(challengeISO: string, slotDays: number) {
  if (!challengeISO) return null;
  const d = new Date(`${challengeISO}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  const delivery = new Date(d);
  delivery.setDate(delivery.getDate() - slotDays);
  const deadline = new Date(delivery);
  deadline.setDate(deadline.getDate() - 1);
  const fmt = (x: Date) => x.toLocaleDateString("fr-CA", { weekday: "short", day: "numeric", month: "short" });
  return { delivery, deadline, deliveryLabel: fmt(delivery), deadlineLabel: fmt(deadline) };
}

export interface KitOrder {
  kitId: string;
  qty: number;
  facil: boolean;
  date: string;
  slot: number;
  pc: string;
  quote: ReturnType<typeof kitQuote>;
  dates: NonNullable<ReturnType<typeof kitDates>>;
  session?: { id: string; title: string; date: string } | null;
}
