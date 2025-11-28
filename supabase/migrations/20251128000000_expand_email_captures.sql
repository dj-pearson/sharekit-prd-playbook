-- Expand email_captures table with additional lead data fields
-- This enables better personalization for email sequences

-- Add first_name and last_name columns (splitting full_name for better personalization)
ALTER TABLE public.email_captures
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add phone number for SMS follow-ups (optional)
ALTER TABLE public.email_captures
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add company for B2B lead qualification (optional)
ALTER TABLE public.email_captures
ADD COLUMN IF NOT EXISTS company TEXT;

-- Migrate existing full_name data to first_name/last_name
-- Split on first space: everything before = first_name, after = last_name
UPDATE public.email_captures
SET
  first_name = CASE
    WHEN full_name IS NOT NULL AND full_name != '' THEN
      SPLIT_PART(full_name, ' ', 1)
    ELSE NULL
  END,
  last_name = CASE
    WHEN full_name IS NOT NULL AND full_name != '' AND POSITION(' ' IN full_name) > 0 THEN
      SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE NULL
  END
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_email_captures_first_name ON public.email_captures(first_name);
CREATE INDEX IF NOT EXISTS idx_email_captures_company ON public.email_captures(company);

COMMENT ON COLUMN public.email_captures.first_name IS 'Lead first name for personalized email greetings';
COMMENT ON COLUMN public.email_captures.last_name IS 'Lead last name for formal communications';
COMMENT ON COLUMN public.email_captures.phone IS 'Optional phone number for SMS follow-ups';
COMMENT ON COLUMN public.email_captures.company IS 'Optional company name for B2B lead qualification';
