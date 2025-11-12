-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Add check constraint for username format (lowercase alphanumeric and hyphens only)
ALTER TABLE public.profiles ADD CONSTRAINT username_format 
  CHECK (username ~* '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND length(username) >= 3 AND length(username) <= 30);

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create function to check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = check_username
  )
$$;