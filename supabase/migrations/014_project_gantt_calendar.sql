-- Gantt calendar: project dates, config, markers

alter table public.projects
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists gantt_config jsonb not null default '{"range":"monthly","zoom":100}'::jsonb;

create table if not exists public.project_gantt_markers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  marker_date date not null,
  color text not null default '#2563eb',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gantt_markers_project on public.project_gantt_markers(project_id);

alter table public.project_gantt_markers enable row level security;

create policy "project_gantt_markers_select" on public.project_gantt_markers for select using (
  public.can_access_project(project_id, 'observer')
);
create policy "project_gantt_markers_write" on public.project_gantt_markers for all using (
  owner_id = auth.uid()
) with check (owner_id = auth.uid());
