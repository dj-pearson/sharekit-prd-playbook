-- Add notification preferences column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_on_signup": true,
  "email_on_download": false,
  "email_on_page_view": false,
  "weekly_digest": true,
  "webhook_failures": true,
  "digest_frequency": "weekly"
}'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences
ON profiles USING gin (notification_preferences);

-- Add comment
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences stored as JSONB';
