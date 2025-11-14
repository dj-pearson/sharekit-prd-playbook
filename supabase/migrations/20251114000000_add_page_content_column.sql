-- Add content JSONB column to pages table for storing custom page builder fields
-- This allows flexible storage of fields like headline, subheadline, button_text, primary_color, etc.

ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.pages.content IS 'Stores custom page builder content fields as JSON (headline, subheadline, button_text, primary_color, etc.)';

-- Create an index for better query performance on content fields
CREATE INDEX IF NOT EXISTS idx_pages_content ON public.pages USING GIN (content);
