-- Create custom_domains table for Business plan feature
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  verification_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  dns_verified_at TIMESTAMPTZ,
  ssl_enabled BOOLEAN DEFAULT false NOT NULL,
  page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_domain CHECK (domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON public.custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verified ON public.custom_domains(is_verified) WHERE is_verified = true;

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom domains"
  ON public.custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create custom domains"
  ON public.custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom domains"
  ON public.custom_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom domains"
  ON public.custom_domains FOR DELETE
  USING (auth.uid() = user_id);

-- Public policy for domain lookups (for routing)
CREATE POLICY "Anyone can view verified domains"
  ON public.custom_domains FOR SELECT
  USING (is_verified = true);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comments
COMMENT ON TABLE public.custom_domains IS 'Custom domain mappings for Business plan users';
COMMENT ON COLUMN public.custom_domains.domain IS 'Full domain name (e.g., share.yourbrand.com)';
COMMENT ON COLUMN public.custom_domains.verification_token IS 'DNS TXT record value for domain verification';
COMMENT ON COLUMN public.custom_domains.is_verified IS 'Whether the domain DNS records have been verified';
COMMENT ON COLUMN public.custom_domains.page_id IS 'Optional: Link domain to a specific page (null = user account default)';
