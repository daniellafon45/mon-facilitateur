-- Project parity: members, registries, gantt, board tasks, method saves

alter table public.project_members
  add column if not exists contact_id uuid references public.contacts(id) on delete set null,
  add column if not exists meeting_role text,
  add column if not exists display_name text,
  add column if not exists color text default '#2563eb';

create table if not exists public.project_registries (
  project_id uuid primary key references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.project_gantt_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_week int not null default 0,
  duration_weeks int not null default 2,
  color text not null default '#2563eb',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  milestone boolean not null default false,
  depends_on uuid references public.project_gantt_phases(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.method_saves (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  method_id text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
  add column if not exists status text default 'pending',
  add column if not exists group_id text,
  add column if not exists kanban_status text default 'todo',
  add column if not exists priority text default 'Moyenne',
  add column if not exists due_date date,
  add column if not exists assignee_contact_id uuid references public.contacts(id) on delete set null,
  add column if not exists description text,
  add column if not exists tags jsonb default '[]'::jsonb,
  add column if not exists subtasks jsonb default '[]'::jsonb,
  add column if not exists board_meta jsonb default '{}'::jsonb;

create index if not exists idx_project_gantt_project on public.project_gantt_phases(project_id);
create index if not exists idx_method_saves_project on public.method_saves(project_id);
create index if not exists idx_tasks_project_board on public.tasks(project_id, kanban_status);

alter table public.project_registries enable row level security;
alter table public.project_gantt_phases enable row level security;
alter table public.method_saves enable row level security;

create policy "project_registries_select" on public.project_registries for select using (
  public.can_access_project(project_id, 'observer')
);
create policy "project_registries_write" on public.project_registries for all using (
  public.is_project_owner(project_id) or public.can_access_project(project_id, 'editor')
) with check (
  owner_id = auth.uid()
);

create policy "project_gantt_select" on public.project_gantt_phases for select using (
  public.can_access_project(project_id, 'observer')
);
create policy "project_gantt_write" on public.project_gantt_phases for all using (
  owner_id = auth.uid()
) with check (owner_id = auth.uid());

create policy "method_saves_select" on public.method_saves for select using (
  public.can_access_project(project_id, 'observer')
);
create policy "method_saves_write" on public.method_saves for all using (
  owner_id = auth.uid()
) with check (owner_id = auth.uid());

drop trigger if exists project_registries_updated on public.project_registries;
create trigger project_registries_updated before update on public.project_registries
  for each row execute function public.set_updated_at();

drop trigger if exists project_gantt_updated on public.project_gantt_phases;
create trigger project_gantt_updated before update on public.project_gantt_phases
  for each row execute function public.set_updated_at();

drop trigger if exists method_saves_updated on public.method_saves;
create trigger method_saves_updated before update on public.method_saves
  for each row execute function public.set_updated_at();
