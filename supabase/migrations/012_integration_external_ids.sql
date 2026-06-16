-- External sync identifiers on core entities

alter table public.meetings
  add column if not exists external_id text,
  add column if not exists sync_source text,
  add column if not exists external_updated_at timestamptz;

alter table public.tasks
  add column if not exists external_id text,
  add column if not exists sync_source text,
  add column if not exists external_updated_at timestamptz;

alter table public.contacts
  add column if not exists external_id text,
  add column if not exists sync_source text,
  add column if not exists external_updated_at timestamptz;

alter table public.documents
  add column if not exists external_id text,
  add column if not exists sync_source text,
  add column if not exists external_updated_at timestamptz;

create index if not exists idx_meetings_external on public.meetings(sync_source, external_id)
  where external_id is not null;
create index if not exists idx_tasks_external on public.tasks(sync_source, external_id)
  where external_id is not null;
create index if not exists idx_contacts_external on public.contacts(sync_source, external_id)
  where external_id is not null;
create index if not exists idx_documents_external on public.documents(sync_source, external_id)
  where external_id is not null;

-- Unique external refs per owner+source
create unique index if not exists uq_meetings_external
  on public.meetings(owner_id, sync_source, external_id)
  where external_id is not null and sync_source is not null;

create unique index if not exists uq_tasks_external
  on public.tasks(owner_id, sync_source, external_id)
  where external_id is not null and sync_source is not null;

create unique index if not exists uq_contacts_external
  on public.contacts(owner_id, sync_source, external_id)
  where external_id is not null and sync_source is not null;

create unique index if not exists uq_documents_external
  on public.documents(owner_id, sync_source, external_id)
  where external_id is not null and sync_source is not null;
