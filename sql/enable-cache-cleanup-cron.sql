-- Enable pg_cron extension (run this in Supabase SQL Editor)
-- Supabase free tier supports pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule: run cleanup every day at 03:00 UTC
SELECT cron.schedule(
  'cleanup-expired-cache',       -- job name
  '0 3 * * *',                   -- cron expression: daily at 3am UTC
  'SELECT cleanup_expired_cache()'
);

-- Verify the job was created
SELECT * FROM cron.job;
