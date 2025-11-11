
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create cron job to process scheduled emails every hour
SELECT cron.schedule(
  'process-scheduled-emails-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tvjgpqmqybtlazabzszo.supabase.co/functions/v1/process-scheduled-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2amdwcW1xeWJ0bGF6YWJ6c3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjQyNTgsImV4cCI6MjA3ODQwMDI1OH0.vvqlkJy7OfaBUHgZBlQVLZrCkz6FTydza35Wn03fxSQ"}'::jsonb,
        body:='{"triggered_by": "cron"}'::jsonb
    ) as request_id;
  $$
);
