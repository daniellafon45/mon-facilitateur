-- Enums
create type public.member_role as enum (
  'owner', 'editor', 'commentator', 'viewer', 'observer'
);

create type public.session_mode as enum ('solo', 'equipe', 'atelier');

create type public.project_status as enum (
  'draft', 'active', 'paused', 'completed', 'archived'
);

create type public.meeting_status as enum (
  'scheduled', 'in_progress', 'completed', 'cancelled'
);

-- Profiles enrichment
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists locale text default 'fr-CA';

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status public.project_status not null default 'active',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  tile text not null default 'violet',
  icon text not null default 'Folder',
  starred boolean not null default false,
  archived boolean not null default false,
  objective text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (project_id, user_id),
  unique (project_id, invited_email)
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  meeting_date date not null default current_date,
  meeting_time time not null default '10:00',
  meeting_type text not null default 'Réunion',
  status public.meeting_status not null default 'scheduled',
  participants_count int not null default 2,
  methods text[] not null default '{}',
  subtitle text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wizard_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.session_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  meeting_id uuid references public.meetings(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  mode public.session_mode not null,
  method_ids text[] not null default '{}',
  current_method_index int not null default 0,
  state jsonb not null default '{}',
  report jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  assignee_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  icon text not null default 'Sparkles',
  title text not null,
  detail text,
  color text not null default 'primary',
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role_label text not null default 'Collaborateur',
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text,
  mime text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]',
  recommendation jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.method_catalog (
  id text primary key,
  title text not null,
  tagline text,
  est_minutes int not null default 45,
  categories text[] not null default '{}',
  icon text not null default 'Sparkles',
  color text not null default 'blue',
  config jsonb not null default '{}',
  interactive boolean not null default true,
  sort_order int not null default 0
);

-- Indexes
create index if not exists idx_projects_owner on public.projects(owner_id);
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_meetings_owner on public.meetings(owner_id);
create index if not exists idx_meetings_project on public.meetings(project_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_session_runs_owner on public.session_runs(owner_id);
create index if not exists idx_activity_user on public.activity_events(user_id);

-- RLS helpers
create or replace function public.member_role_rank(r public.member_role)
returns int language sql immutable as $$
  select case r
    when 'owner' then 5
    when 'editor' then 4
    when 'commentator' then 3
    when 'viewer' then 2
    when 'observer' then 1
  end;
$$;

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

create or replace function public.get_project_role(p_project_id uuid)
returns public.member_role language sql security definer stable set search_path = public as $$
  select coalesce(
    (select role from public.project_members
     where project_id = p_project_id and user_id = auth.uid()),
    case when public.is_project_owner(p_project_id) then 'owner'::public.member_role end
  );
$$;

create or replace function public.can_access_project(
  p_project_id uuid,
  p_min_role public.member_role default 'viewer'
)
returns boolean language sql security definer stable set search_path = public as $$
  select public.member_role_rank(public.get_project_role(p_project_id))
       >= public.member_role_rank(p_min_role);
$$;

-- Enable RLS
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.meetings enable row level security;
alter table public.wizard_drafts enable row level security;
alter table public.session_runs enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_events enable row level security;
alter table public.contacts enable row level security;
alter table public.teams enable row level security;
alter table public.documents enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.method_catalog enable row level security;

-- Projects policies
create policy "projects_select" on public.projects for select using (
  owner_id = auth.uid() or public.can_access_project(id, 'observer')
);
create policy "projects_insert" on public.projects for insert with check (owner_id = auth.uid());
create policy "projects_update" on public.projects for update using (
  owner_id = auth.uid() or public.can_access_project(id, 'editor')
);
create policy "projects_delete" on public.projects for delete using (owner_id = auth.uid());

-- Project members
create policy "members_select" on public.project_members for select using (
  public.can_access_project(project_id, 'observer')
);
create policy "members_manage" on public.project_members for all using (
  public.is_project_owner(project_id) or public.can_access_project(project_id, 'editor')
);

-- Meetings
create policy "meetings_select" on public.meetings for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'observer'))
);
create policy "meetings_insert" on public.meetings for insert with check (owner_id = auth.uid());
create policy "meetings_update" on public.meetings for update using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'editor'))
);
create policy "meetings_delete" on public.meetings for delete using (owner_id = auth.uid());

-- Wizard drafts
create policy "wizard_own" on public.wizard_drafts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Session runs
create policy "sessions_select" on public.session_runs for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'observer'))
);
create policy "sessions_write" on public.session_runs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Tasks
create policy "tasks_select" on public.tasks for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'observer'))
);
create policy "tasks_write" on public.tasks for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Activity, contacts, teams, documents, chat
create policy "activity_own" on public.activity_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contacts_own" on public.contacts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "teams_own" on public.teams for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "documents_select" on public.documents for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'observer'))
);
create policy "documents_write" on public.documents for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "chat_own" on public.chat_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Method catalog: read-only for authenticated users
create policy "methods_read" on public.method_catalog for select to authenticated using (true);

-- Auto-add owner as project member on create
create or replace function public.handle_new_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project();

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated on public.projects;
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists meetings_updated on public.meetings;
create trigger meetings_updated before update on public.meetings
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_updated on public.tasks;
create trigger tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists wizard_drafts_updated on public.wizard_drafts;
create trigger wizard_drafts_updated before update on public.wizard_drafts
  for each row execute function public.set_updated_at();
