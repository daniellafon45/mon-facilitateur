-- Integration platform schema

create type public.integration_status as enum ('connected', 'disconnected', 'error', 'pending');
create type public.sync_job_status as enum ('pending', 'running', 'done', 'failed');
create type public.sync_direction as enum ('pull', 'push', 'bidirectional');

-- Static provider catalog
create table if not exists public.integration_providers (
  id text primary key,
  name text not null,
  category text not null,
  oauth_type text not null default 'oauth2',
  scopes text[] not null default '{}',
  status text not null default 'active',
  sort_order int not null default 0
);

insert into public.integration_providers (id, name, category, oauth_type, scopes, sort_order) values
  ('gdrive', 'Google Drive', 'Stockage', 'oauth2', array['https://www.googleapis.com/auth/drive.file'], 1),
  ('slack', 'Slack', 'Communication', 'oauth2', array['channels:read', 'chat:write', 'users:read'], 2),
  ('teams', 'Microsoft Teams', 'Communication', 'oauth2', array['Calendars.ReadWrite', 'ChannelMessage.Send', 'OnlineMeetings.ReadWrite'], 3),
  ('gcal', 'Google Calendar', 'Calendrier', 'oauth2', array['https://www.googleapis.com/auth/calendar.events'], 4),
  ('notion', 'Notion', 'Productivité', 'oauth2', array[], 5),
  ('trello', 'Trello', 'Gestion de projet', 'oauth1', array['read', 'write'], 6),
  ('dropbox', 'Dropbox', 'Stockage', 'oauth2', array['files.content.read', 'files.content.write'], 7),
  ('zapier', 'Zapier', 'Automatisation', 'webhook', array[], 8),
  ('miro', 'Miro', 'Productivité', 'oauth2', array['boards:read', 'boards:write'], 9),
  ('asana', 'Asana', 'Gestion de projet', 'oauth2', array['tasks:read', 'tasks:write'], 10),
  ('onedrive', 'OneDrive', 'Stockage', 'oauth2', array['Files.ReadWrite'], 11),
  ('hubspot', 'HubSpot', 'CRM', 'oauth2', array['crm.objects.contacts.read', 'crm.objects.contacts.write'], 12)
on conflict (id) do nothing;

-- User connections (no tokens here — separate table)
create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null references public.integration_providers(id) on delete cascade,
  status public.integration_status not null default 'pending',
  external_account_id text,
  external_account_name text,
  metadata jsonb not null default '{}',
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider_id)
);

-- Encrypted tokens (server-only access via service role)
create table if not exists public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  user_integration_id uuid not null references public.user_integrations(id) on delete cascade unique,
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  token_type text not null default 'Bearer',
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-project integration config
create table if not exists public.project_integration_settings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null references public.integration_providers(id) on delete cascade,
  settings jsonb not null default '{}',
  conflict_policy text not null default 'last_write_wins',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, provider_id)
);

-- Sync cursors
create table if not exists public.integration_sync_state (
  id uuid primary key default gen_random_uuid(),
  user_integration_id uuid not null references public.user_integrations(id) on delete cascade,
  entity_type text not null,
  direction public.sync_direction not null default 'bidirectional',
  last_synced_at timestamptz,
  external_cursor text,
  etag text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_integration_id, entity_type, direction)
);

-- Webhook event log
create table if not exists public.integration_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  external_event_id text not null,
  owner_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}',
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (provider_id, external_event_id)
);

-- Sync job queue
create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  user_integration_id uuid references public.user_integrations(id) on delete cascade,
  provider_id text not null,
  entity_type text not null,
  direction public.sync_direction not null default 'bidirectional',
  status public.sync_job_status not null default 'pending',
  retry_count int not null default 0,
  max_retries int not null default 3,
  error text,
  result jsonb,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Zapier webhook keys per user
create table if not exists public.zapier_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade unique,
  webhook_secret text not null,
  inbound_url_token text not null default encode(gen_random_bytes(24), 'hex'),
  outbound_webhook_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_integrations_owner on public.user_integrations(owner_id);
create index if not exists idx_user_integrations_provider on public.user_integrations(provider_id);
create index if not exists idx_project_integration_project on public.project_integration_settings(project_id);
create index if not exists idx_sync_jobs_status on public.sync_jobs(status, scheduled_at);
create index if not exists idx_sync_jobs_owner on public.sync_jobs(owner_id);
create index if not exists idx_webhook_events_provider on public.integration_webhook_events(provider_id, created_at desc);

-- RLS
alter table public.integration_providers enable row level security;
alter table public.user_integrations enable row level security;
alter table public.integration_tokens enable row level security;
alter table public.project_integration_settings enable row level security;
alter table public.integration_sync_state enable row level security;
alter table public.integration_webhook_events enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.zapier_connections enable row level security;

-- Providers: read-only for authenticated
create policy "integration_providers_read" on public.integration_providers
  for select to authenticated using (true);

-- User integrations
create policy "user_integrations_own" on public.user_integrations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Tokens: no client access (service role only — no policy for authenticated)
create policy "integration_tokens_deny" on public.integration_tokens
  for all using (false);

-- Project settings
create policy "project_integration_select" on public.project_integration_settings
  for select using (
    owner_id = auth.uid()
    or public.can_access_project(project_id, 'observer')
  );
create policy "project_integration_write" on public.project_integration_settings
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Sync state
create policy "sync_state_own" on public.integration_sync_state
  for select using (
    exists (
      select 1 from public.user_integrations ui
      where ui.id = user_integration_id and ui.owner_id = auth.uid()
    )
  );

-- Webhook events (read own)
create policy "webhook_events_own" on public.integration_webhook_events
  for select using (owner_id = auth.uid());

-- Sync jobs
create policy "sync_jobs_own" on public.sync_jobs
  for select using (owner_id = auth.uid());

-- Zapier
create policy "zapier_own" on public.zapier_connections
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- updated_at triggers
drop trigger if exists user_integrations_updated on public.user_integrations;
create trigger user_integrations_updated before update on public.user_integrations
  for each row execute function public.set_updated_at();

drop trigger if exists integration_tokens_updated on public.integration_tokens;
create trigger integration_tokens_updated before update on public.integration_tokens
  for each row execute function public.set_updated_at();

drop trigger if exists project_integration_settings_updated on public.project_integration_settings;
create trigger project_integration_settings_updated before update on public.project_integration_settings
  for each row execute function public.set_updated_at();

drop trigger if exists integration_sync_state_updated on public.integration_sync_state;
create trigger integration_sync_state_updated before update on public.integration_sync_state
  for each row execute function public.set_updated_at();

drop trigger if exists zapier_connections_updated on public.zapier_connections;
create trigger zapier_connections_updated before update on public.zapier_connections
  for each row execute function public.set_updated_at();
