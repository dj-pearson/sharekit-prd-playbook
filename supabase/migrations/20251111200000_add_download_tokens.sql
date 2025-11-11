-- Add download token fields to email_captures table
ALTER TABLE public.email_captures
ADD COLUMN download_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
ADD COLUMN download_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN last_downloaded_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX idx_email_captures_download_token ON public.email_captures(download_token);

-- Create RLS policy for public token access
CREATE POLICY "Anyone can view email capture by valid token"
  ON public.email_captures FOR SELECT
  USING (
    download_token IS NOT NULL
    AND token_expires_at > now()
  );

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.email_captures
  SET
    download_count = download_count + 1,
    last_downloaded_at = now()
  WHERE download_token = token
  AND token_expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
