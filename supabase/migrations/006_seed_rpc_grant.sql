-- Permet au script seed (signup + sign-in) d'appeler seed_demo_data_for_user sans service_role JWT
create or replace function public.seed_demo_data_for_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_project_id uuid;
begin
  if auth.uid() is distinct from p_user_id
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Non autorisé';
  end if;

  update public.profiles set
    first_name = 'Test',
    last_name = 'Utilisateur',
    role = 'Facilitateur',
    org = 'Mon facilitateur',
    goals = array['Animer des ateliers', 'Structurer mes projets'],
    onboarded = true,
    display_name = 'Test Utilisateur',
    locale = 'fr-CA'
  where id = p_user_id;

  insert into public.projects (id, owner_id, name, status, progress, tile, icon, objective)
  values (
    gen_random_uuid(), p_user_id,
    'Accueil étudiants internationaux',
    'active', 35, 'teal', 'Users',
    'Repenser l''expérience d''accueil des nouveaux arrivants'
  )
  returning id into v_project_id;

  insert into public.meetings (project_id, owner_id, name, meeting_date, meeting_time, meeting_type, status, participants_count, methods)
  values
    (v_project_id, p_user_id, 'Kick-off équipe accueil', current_date + 3, '10:00', 'Kick-off', 'scheduled', 8, array['brainstorm', 'bmc']),
    (v_project_id, p_user_id, 'Atelier parcours usager', current_date + 10, '14:00', 'Atelier', 'scheduled', 12, array['parcours-utilisateur']);

  insert into public.tasks (project_id, owner_id, title, done) values
    (v_project_id, p_user_id, 'Préparer le questionnaire d''accueil', false),
    (v_project_id, p_user_id, 'Cartographier les parties prenantes', false),
    (v_project_id, p_user_id, 'Valider le budget prévisionnel', true);

  insert into public.contacts (owner_id, name, email, role_label) values
    (p_user_id, 'Sophie Martin', 'sophie@example.com', 'Responsable accueil'),
    (p_user_id, 'Alex Tremblay', 'alex@example.com', 'Étudiant ambassadeur'),
    (p_user_id, 'Fatima Benali', 'fatima@example.com', 'Coordination internationale');

  insert into public.activity_events (user_id, project_id, icon, title, detail, color) values
    (p_user_id, v_project_id, 'Folder', 'Projet créé', 'Accueil étudiants internationaux', 'primary'),
    (p_user_id, v_project_id, 'Calendar', 'Rencontre planifiée', 'Kick-off équipe accueil', 'accent');
end;
$$;

grant execute on function public.seed_demo_data_for_user(uuid) to authenticated;
