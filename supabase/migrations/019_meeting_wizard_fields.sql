-- Wizard completion fields on meetings
alter table public.meetings
  add column if not exists agenda jsonb default null,
  add column if not exists meeting_end time default null,
  add column if not exists meeting_platform text default null,
  add column if not exists meeting_link text default null,
  add column if not exists wizard_meta jsonb default null,
  add column if not exists starred boolean not null default false;

create index if not exists idx_meetings_agenda on public.meetings using gin (agenda)
  where agenda is not null;

create index if not exists idx_meetings_starred on public.meetings (starred)
  where starred = true;
