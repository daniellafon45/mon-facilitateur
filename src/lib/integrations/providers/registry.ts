import type { ProviderCatalogEntry, ProviderId } from "../types";

export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: "gdrive",
    name: "Google Drive",
    category: "Stockage",
    color: "#34a853",
    bg: "#e8f5e9",
    desc: "Stockez, partagez et accédez à vos fichiers facilement.",
    popular: true,
    oauthGroup: "google",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    color: "#4a154b",
    bg: "#f3e5f5",
    desc: "Recevez des notifications et partagez vos réunions.",
    popular: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "Communication",
    color: "#5059c9",
    bg: "#e8eaf6",
    desc: "Planifiez, lancez et suivez réunions depuis Teams.",
    popular: true,
    oauthGroup: "microsoft",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    category: "Calendrier",
    color: "#1a73e8",
    bg: "#e3f2fd",
    desc: "Synchronisez vos rencontres et ne manquez rien.",
    popular: true,
    oauthGroup: "google",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Productivité",
    color: "#1f1f1f",
    bg: "#f5f5f5",
    desc: "Centralisez vos notes, décisions et documents.",
    popular: true,
  },
  {
    id: "trello",
    name: "Trello",
    category: "Gestion de projet",
    color: "#0079bf",
    bg: "#e3f2fd",
    desc: "Transformez vos idées en tâches et suivez leur avancement.",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "Stockage",
    color: "#0061ff",
    bg: "#e3f2fd",
    desc: "Importez et partagez vos fichiers en toute simplicité.",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automatisation",
    color: "#ff4a00",
    bg: "#fff3e0",
    desc: "Automatisez vos workflows entre vos outils.",
  },
  {
    id: "miro",
    name: "Miro",
    category: "Productivité",
    color: "#ffd02f",
    bg: "#fffde7",
    desc: "Importez vos tableaux et collaborez visuellement.",
  },
  {
    id: "asana",
    name: "Asana",
    category: "Gestion de projet",
    color: "#f06a6a",
    bg: "#fce4ec",
    desc: "Suivez vos projets et tâches depuis Mon facilitateur.",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    category: "Stockage",
    color: "#0078d4",
    bg: "#e3f2fd",
    desc: "Accédez à vos fichiers Microsoft OneDrive.",
    oauthGroup: "microsoft",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    color: "#ff7a59",
    bg: "#fff3e0",
    desc: "Synchronisez vos contacts et opportunités.",
  },
];

export const POPULAR_PROVIDER_IDS: ProviderId[] = PROVIDER_CATALOG.filter((p) => p.popular).map(
  (p) => p.id,
);

export const INTEGRATION_CATEGORIES = [
  "Toutes les catégories",
  "Productivité",
  "Communication",
  "Stockage",
  "Gestion de projet",
  "Calendrier",
  "CRM",
  "Automatisation",
] as const;

export function getProviderCatalogEntry(id: ProviderId): ProviderCatalogEntry | undefined {
  return PROVIDER_CATALOG.find((p) => p.id === id);
}

export function getAllProviderIds(): ProviderId[] {
  return PROVIDER_CATALOG.map((p) => p.id);
}
