-- Persist meeting report snapshot (compte rendu, tâches, highlights) on meetings
alter table public.meetings
  add column if not exists snapshot jsonb default null;

create index if not exists idx_meetings_snapshot on public.meetings using gin (snapshot)
  where snapshot is not null;
