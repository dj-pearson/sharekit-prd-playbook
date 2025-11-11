-- Create page variants table for A/B testing
CREATE TABLE IF NOT EXISTS public.page_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'minimal',
  custom_css TEXT,
  traffic_percentage INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_variant_slug_per_page UNIQUE(page_id, slug)
);

-- Create variant analytics table
CREATE TABLE IF NOT EXISTS public.variant_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.page_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_variants
CREATE POLICY "Users can view variants for their pages"
  ON public.page_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_variants.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create variants for their pages"
  ON public.page_variants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_variants.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variants for their pages"
  ON public.page_variants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_variants.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variants for their pages"
  ON public.page_variants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_variants.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- RLS policies for variant_analytics
CREATE POLICY "Users can view analytics for their variants"
  ON public.variant_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM page_variants
      JOIN pages ON pages.id = page_variants.page_id
      WHERE page_variants.id = variant_analytics.variant_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create variant analytics"
  ON public.variant_analytics
  FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger for page_variants
CREATE TRIGGER update_page_variants_updated_at
  BEFORE UPDATE ON public.page_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();