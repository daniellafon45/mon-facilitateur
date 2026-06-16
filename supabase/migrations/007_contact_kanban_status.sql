alter table public.contacts
  add column if not exists status text not null default 'todo'
  check (status in ('todo', 'in_progress', 'done'));

-- Répartir les contacts démo sur le board
update public.contacts set status = 'done' where name = 'Sophie Martin';
update public.contacts set status = 'in_progress' where name = 'Alex Tremblay';
update public.contacts set status = 'todo' where name = 'Fatima Benali';
