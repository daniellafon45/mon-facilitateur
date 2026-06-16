import type { IntegrationProviderAdapter, ProviderId } from "../types";
import { gdriveProvider, gcalProvider } from "./google";
import { teamsProvider, onedriveProvider } from "./microsoft";
import { slackProvider } from "./slack";
import { notionProvider } from "./notion";
import { trelloProvider } from "./trello";
import { dropboxProvider } from "./dropbox";
import { miroProvider } from "./miro";
import { asanaProvider } from "./asana";
import { hubspotProvider } from "./hubspot";
import { zapierProvider } from "./zapier";

const ADAPTERS: Record<ProviderId, IntegrationProviderAdapter> = {
  gdrive: gdriveProvider,
  gcal: gcalProvider,
  teams: teamsProvider,
  onedrive: onedriveProvider,
  slack: slackProvider,
  notion: notionProvider,
  trello: trelloProvider,
  dropbox: dropboxProvider,
  miro: miroProvider,
  asana: asanaProvider,
  hubspot: hubspotProvider,
  zapier: zapierProvider,
};

export function getProviderAdapter(id: ProviderId): IntegrationProviderAdapter {
  const adapter = ADAPTERS[id];
  if (!adapter) throw new Error(`Provider inconnu: ${id}`);
  return adapter;
}

export function isValidProviderId(id: string): id is ProviderId {
  return id in ADAPTERS;
}

export { ADAPTERS };
