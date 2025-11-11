-- Add onboarding tracking fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed
ON public.profiles(onboarding_completed)
WHERE onboarding_completed = false;

-- Add comment
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed the onboarding wizard';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'Current step in onboarding (0-5)';
COMMENT ON COLUMN public.profiles.onboarding_skipped_at IS 'Timestamp when user skipped onboarding';
