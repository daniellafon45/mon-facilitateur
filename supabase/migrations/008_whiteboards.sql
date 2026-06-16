-- Tableaux blancs persistés (éléments JSON + lien projet optionnel)
create table if not exists public.whiteboards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  elements jsonb not null default '[]',
  view_state jsonb not null default '{"tx":0,"ty":0,"k":1}',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_whiteboards_owner on public.whiteboards(owner_id);
create index if not exists idx_whiteboards_project on public.whiteboards(project_id);
create index if not exists idx_whiteboards_updated on public.whiteboards(updated_at desc);

alter table public.whiteboards enable row level security;

create policy "whiteboards_select" on public.whiteboards for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'observer'))
);

create policy "whiteboards_insert" on public.whiteboards for insert with check (
  owner_id = auth.uid()
);

create policy "whiteboards_update" on public.whiteboards for update using (
  owner_id = auth.uid()
  or (project_id is not null and public.can_access_project(project_id, 'editor'))
);

create policy "whiteboards_delete" on public.whiteboards for delete using (
  owner_id = auth.uid()
);

drop trigger if exists whiteboards_updated on public.whiteboards;
create trigger whiteboards_updated before update on public.whiteboards
  for each row execute function public.set_updated_at();
