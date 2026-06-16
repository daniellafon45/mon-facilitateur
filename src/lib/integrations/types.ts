export type ProviderId =
  | "gdrive"
  | "slack"
  | "teams"
  | "gcal"
  | "notion"
  | "trello"
  | "dropbox"
  | "zapier"
  | "miro"
  | "asana"
  | "onedrive"
  | "hubspot";

export type IntegrationCategory =
  | "Stockage"
  | "Communication"
  | "Calendrier"
  | "Productivité"
  | "Gestion de projet"
  | "Automatisation"
  | "CRM";

export type EntityType = "meetings" | "tasks" | "contacts" | "documents" | "projects";

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scopes?: string[];
}

export interface SyncContext {
  userId: string;
  userIntegrationId: string;
  providerId: ProviderId;
  accessToken: string;
  entityType: EntityType;
  projectId?: string;
  settings?: Record<string, unknown>;
}

export interface SyncResult {
  pulled: number;
  pushed: number;
  errors: string[];
  cursor?: string;
}

export interface WebhookRegistration {
  id: string;
  expiresAt?: Date;
}

export interface IntegrationProviderAdapter {
  id: ProviderId;
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<TokenSet & { accountId?: string; accountName?: string }>;
  refreshToken(refresh: string): Promise<TokenSet>;
  revoke?(token: string): Promise<void>;
  pullChanges(ctx: SyncContext): Promise<SyncResult>;
  pushChanges(ctx: SyncContext): Promise<SyncResult>;
  registerWebhook?(ctx: SyncContext): Promise<WebhookRegistration>;
  handleWebhook?(payload: unknown, ctx?: SyncContext): Promise<SyncResult>;
}

export interface ProviderCatalogEntry {
  id: ProviderId;
  name: string;
  category: IntegrationCategory;
  color: string;
  bg: string;
  desc: string;
  popular?: boolean;
  oauthGroup?: "google" | "microsoft";
}

export interface UserIntegrationRow {
  id: string;
  owner_id: string;
  provider_id: ProviderId;
  status: "connected" | "disconnected" | "error" | "pending";
  external_account_id: string | null;
  external_account_name: string | null;
  metadata: Record<string, unknown>;
  connected_at: string | null;
}

export interface ProjectIntegrationSettings {
  id: string;
  project_id: string;
  provider_id: ProviderId;
  settings: Record<string, unknown>;
  conflict_policy: string;
  enabled: boolean;
}
