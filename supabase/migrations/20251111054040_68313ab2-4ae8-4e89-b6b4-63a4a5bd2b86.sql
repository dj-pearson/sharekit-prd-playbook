-- Add download_count column to email_captures
ALTER TABLE public.email_captures 
ADD COLUMN download_count INTEGER DEFAULT 0;