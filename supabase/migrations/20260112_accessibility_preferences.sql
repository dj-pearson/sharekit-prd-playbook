-- Add accessibility_preferences column to profiles table
-- This stores user accessibility settings for server-side rendering and cross-device sync

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS accessibility_preferences JSONB DEFAULT '{
  "reducedMotion": false,
  "highContrast": false,
  "fontSize": "normal",
  "screenReaderAnnouncements": true
}'::jsonb;

-- Create an index for faster queries on accessibility preferences
CREATE INDEX IF NOT EXISTS idx_profiles_accessibility_preferences
ON profiles USING gin (accessibility_preferences);

-- Add comment for documentation
COMMENT ON COLUMN profiles.accessibility_preferences IS
'User accessibility preferences for ADA/WCAG compliance. Settings include reducedMotion, highContrast, fontSize, and screenReaderAnnouncements.';

-- Create a function to update accessibility preferences
CREATE OR REPLACE FUNCTION update_accessibility_preferences(
  user_id UUID,
  preferences JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_preferences JSONB;
BEGIN
  UPDATE profiles
  SET accessibility_preferences = COALESCE(accessibility_preferences, '{}'::jsonb) || preferences,
      updated_at = NOW()
  WHERE id = user_id
  RETURNING accessibility_preferences INTO updated_preferences;

  RETURN updated_preferences;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_accessibility_preferences(UUID, JSONB) TO authenticated;
