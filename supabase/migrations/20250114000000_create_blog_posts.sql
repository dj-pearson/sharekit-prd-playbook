-- Create blog_posts table for SEO content strategy
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL DEFAULT 'Dan Pearson',
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  read_time TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,

  -- Analytics
  views_count INTEGER DEFAULT 0,

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN(search_vector);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Only authenticated admins can insert/update/delete
-- (You'll need to adjust this based on your admin authentication setup)
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Insert sample blog posts for testing
INSERT INTO blog_posts (
  slug,
  title,
  excerpt,
  content,
  featured_image,
  author,
  category,
  status,
  read_time,
  published_at,
  meta_title,
  meta_description,
  meta_keywords
) VALUES
(
  'how-to-share-pdf-with-email-capture',
  'How to Share a PDF with Email Capture (5-Minute Guide)',
  'Learn how to create professional landing pages that capture emails before delivering your PDF resources. Step-by-step guide with ShareKit.',
  '## Quick Answer

The simplest way to share a PDF with email capture is to use a dedicated resource delivery platform like ShareKit. Upload your PDF, choose a template, customize your landing page, and publish. When someone enters their email, they instantly receive your PDF.

## What You''ll Learn

- How to create an email capture landing page for PDFs
- Best practices for converting visitors to subscribers
- Step-by-step setup with ShareKit (5 minutes)
- Common mistakes to avoid

[... Full content from BlogPost.tsx ...]',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200',
  'Dan Pearson',
  'How-To Guides',
  'published',
  '7 min read',
  NOW(),
  'How to Share a PDF with Email Capture (5-Minute Guide)',
  'Learn how to create professional landing pages that capture emails before delivering your PDF resources. Step-by-step ShareKit guide.',
  ARRAY['share PDF with email capture', 'PDF landing page', 'email capture for PDFs', 'lead magnet delivery', 'resource sharing']
),
(
  'simple-way-to-deliver-digital-resources',
  'The Simple Way to Deliver Digital Resources to Clients',
  'Compare 3 methods for delivering digital resources: Google Drive, manual email, and automated platforms like ShareKit. Find the best approach for your business.',
  '## Introduction

Delivering digital resources to clients doesn''t have to be complicated. In this guide, we''ll compare three popular methods and help you choose the best one for your needs.

## Method 1: Google Drive

**Pros:**
- Free
- Familiar to most people
- Good for large files

**Cons:**
- No email capture
- Manual sharing process
- No analytics
- Not professional-looking

## Method 2: Manual Email

**Pros:**
- Personal touch
- Direct communication
- Free

**Cons:**
- Time-consuming
- No automation
- Prone to errors
- Difficult to scale

## Method 3: ShareKit (Automated Platform)

**Pros:**
- 5-minute setup
- Automated delivery
- Email capture built-in
- Professional landing pages
- Analytics included
- Scalable

**Cons:**
- Small monthly cost ($19)

## Conclusion

For most creators, coaches, and consultants, ShareKit offers the best balance of simplicity, professionalism, and automation.',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
  'Dan Pearson',
  'How-To Guides',
  'published',
  '6 min read',
  NOW() - INTERVAL ''3 days'',
  'The Simple Way to Deliver Digital Resources to Clients',
  'Compare 3 methods for delivering digital resources: Google Drive, manual email, and ShareKit. Find the best approach for your creator business.',
  ARRAY['deliver digital resources', 'resource delivery methods', 'ShareKit vs Google Drive', 'automated resource delivery']
),
(
  'convertkit-alternatives-for-lead-magnet-delivery',
  'ConvertKit Alternatives for Simple Lead Magnet Delivery',
  'If you''re only using ConvertKit for lead magnet delivery, you''re overpaying. Discover simpler, more affordable alternatives that focus on what you actually need.',
  '## The ConvertKit Problem

ConvertKit is an excellent email marketing platform, but it''s overkill if you just want to deliver lead magnets. You''re paying $29-79/month for features you don''t use.

## What You Actually Need

For simple lead magnet delivery, you need:
1. Email capture forms
2. Automated resource delivery
3. Basic analytics
4. Professional-looking landing pages

You DON''T need:
- Complex automation sequences
- Email broadcasting
- Subscriber tagging systems
- Visual automation builders

## Alternative 1: ShareKit

**Best for:** Creators who want simplicity

**Pricing:** $19/month (vs ConvertKit''s $29-79)

**Setup time:** 5 minutes (vs 2+ hours)

**What you get:**
- Beautiful landing page templates
- Automated email delivery
- Analytics dashboard
- Email capture
- Custom domains (Business plan)

## Alternative 2: Gumroad

**Best for:** Selling digital products

**Pricing:** Free + 10% transaction fee

**What you get:**
- Product pages
- Payment processing
- Email delivery
- Basic analytics

**Drawbacks:**
- Focused on paid products
- Less customization
- Transaction fees add up

## Alternative 3: Carrd + Mailchimp Free

**Best for:** DIY enthusiasts

**Pricing:** $19/year (Carrd) + Free (Mailchimp)

**What you get:**
- Custom landing pages
- Email marketing
- Up to 500 contacts

**Drawbacks:**
- Manual setup required
- Two separate platforms
- More complex workflow

## Which Should You Choose?

**Choose ShareKit if:**
- You want the simplest solution
- You value your time (5-minute setup)
- You want professional templates
- You''re focused on resource delivery

**Choose ConvertKit if:**
- You need full email marketing capabilities
- You want to run email sequences
- You have budget for $29-79/month
- You need advanced automation

## Conclusion

For most coaches, consultants, and course creators who just want to deliver lead magnets, ShareKit provides everything you need at 40% less cost and 90% less complexity than ConvertKit.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
  'Dan Pearson',
  'Comparisons',
  'published',
  '8 min read',
  NOW() - INTERVAL ''5 days'',
  'ConvertKit Alternatives for Simple Lead Magnet Delivery',
  'If you''re only using ConvertKit for lead magnets, you''re overpaying. Discover simpler, affordable alternatives like ShareKit that focus on what you need.',
  ARRAY['ConvertKit alternatives', 'lead magnet delivery', 'email capture tools', 'ShareKit vs ConvertKit', 'simple email marketing']
);

-- Comment describing the table
COMMENT ON TABLE blog_posts IS 'Blog posts for SEO content strategy - stores articles, guides, and comparison content';
