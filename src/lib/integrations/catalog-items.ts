import { PROVIDER_CATALOG } from "./providers/registry";
import type { ProviderCatalogEntry } from "./types";

export interface IntegrationItem extends ProviderCatalogEntry {
  status: string;
  connectedAt: string | null;
  accountName: string | null;
}

export function buildFallbackIntegrations(): IntegrationItem[] {
  return PROVIDER_CATALOG.map((p) => ({
    ...p,
    status: "disconnected",
    connectedAt: null,
    accountName: null,
  }));
}
