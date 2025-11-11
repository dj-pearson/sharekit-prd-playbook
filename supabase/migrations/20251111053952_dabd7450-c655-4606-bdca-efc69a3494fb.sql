-- Add missing columns to email_captures table
ALTER TABLE public.email_captures 
ADD COLUMN download_token TEXT UNIQUE,
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add missing column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Create custom_domains table
CREATE TABLE public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT NOT NULL,
  dns_verified_at TIMESTAMP WITH TIME ZONE,
  ssl_issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on custom_domains
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_domains
CREATE POLICY "Users can view their own domains"
  ON public.custom_domains
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domains"
  ON public.custom_domains
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON public.custom_domains
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON public.custom_domains
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create increment_download_count function
CREATE OR REPLACE FUNCTION public.increment_download_count(capture_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be called to increment download counts if needed
  -- Currently just a placeholder for the download page
  RETURN;
END;
$$;

-- Add trigger for custom_domains updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();