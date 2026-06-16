-- pg_cron jobs for integration sync (requires pg_cron extension on Supabase Pro)
-- Run manually via POST /api/integrations/cron if pg_cron unavailable

-- select cron.schedule(
--   'integration-token-refresh',
--   '*/10 * * * *',
--   $$ select net.http_post(
--     url := current_setting('app.settings.cron_url') || '/api/integrations/cron',
--     headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')),
--     body := '{}'::jsonb
--   ) $$
-- );

comment on table public.sync_jobs is 'Integration sync queue — processed by /api/integrations/cron';
