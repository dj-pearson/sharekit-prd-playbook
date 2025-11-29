-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  featured_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create help_articles table
CREATE TABLE public.help_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_articles
CREATE POLICY "Anyone can view published help articles"
ON public.help_articles
FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can manage all help articles"
ON public.help_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  display_location TEXT NOT NULL DEFAULT 'banner',
  target_audience TEXT NOT NULL DEFAULT 'all',
  dismissible BOOLEAN NOT NULL DEFAULT true,
  cta_text TEXT,
  cta_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements"
ON public.announcements
FOR SELECT
USING (
  active = true 
  AND starts_at <= now() 
  AND (ends_at IS NULL OR ends_at >= now())
);

CREATE POLICY "Admins can manage all announcements"
ON public.announcements
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create moderation_queue table
CREATE TABLE public.moderation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  moderator_id UUID,
  moderated_at TIMESTAMPTZ,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_queue
CREATE POLICY "Admins can view all moderation items"
ON public.moderation_queue
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update moderation items"
ON public.moderation_queue
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert moderation items"
ON public.moderation_queue
FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
BEFORE UPDATE ON public.help_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moderation_queue_updated_at
BEFORE UPDATE ON public.moderation_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();