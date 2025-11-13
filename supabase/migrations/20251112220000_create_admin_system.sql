-- ShareKit Admin System Database Schema
-- Created: 2025-11-12
-- Phase: All tables for complete admin system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support_manager', 'content_manager', 'read_only')),
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- ADMIN ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FEATURE FLAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_type TEXT DEFAULT 'all' CHECK (rollout_type IN ('all', 'percentage', 'users', 'plans')),
  rollout_percentage INTEGER CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  rollout_user_ids UUID[],
  rollout_plans TEXT[],
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT CHECK (category IN ('billing', 'technical', 'feature', 'bug', 'account', 'other')),
  tags TEXT[],
  metadata JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUPPORT TICKET MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BLOG POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[],
  category TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HELP CENTER ARTICLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  related_article_ids UUID[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM METRICS (Time-series data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  dimensions JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODERATION QUEUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('resource', 'page', 'user', 'signup')),
  resource_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  auto_flagged BOOLEAN DEFAULT false,
  flag_metadata JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM ANNOUNCEMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  display_location TEXT DEFAULT 'banner' CHECK (display_location IN ('banner', 'modal', 'toast')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'pro', 'business')),
  active BOOLEAN DEFAULT true,
  dismissible BOOLEAN DEFAULT true,
  cta_text TEXT,
  cta_url TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  dismissal_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CANNED RESPONSES (for support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  shortcut TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Admin activity log indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource ON admin_activity_log(resource_type, resource_id);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at ASC);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Help articles indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);
CREATE INDEX IF NOT EXISTS idx_help_articles_status ON help_articles(status);
CREATE INDEX IF NOT EXISTS idx_help_articles_order ON help_articles(category, order_index);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON system_metrics(metric_name, timestamp DESC);

-- Moderation queue indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_resource ON moderation_queue(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON moderation_queue(created_at DESC);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(starts_at, ends_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admin users can view all admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'super_admin'
    )
  );

-- Admin activity log policies
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert activity logs"
  ON admin_activity_log FOR INSERT
  WITH CHECK (true);

-- Feature flags policies
CREATE POLICY "Anyone can view enabled feature flags"
  ON feature_flags FOR SELECT
  USING (enabled = true OR EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin')
    )
  );

-- Support tickets policies
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'support_manager')
    )
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'support_manager')
    )
  );

-- Support messages policies
CREATE POLICY "Users and admins can view ticket messages"
  ON support_messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id AND st.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'support_manager')
    )
  );

CREATE POLICY "Users and admins can create messages"
  ON support_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM support_tickets st
        WHERE st.id = ticket_id AND st.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
        AND au.role IN ('super_admin', 'admin', 'support_manager')
      )
    )
  );

-- Blog posts policies (public read for published)
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.role IN ('super_admin', 'admin', 'content_manager')
  ));

CREATE POLICY "Content managers can manage blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Help articles policies (public read for published)
CREATE POLICY "Anyone can view published help articles"
  ON help_articles FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id = auth.uid()
    AND au.role IN ('super_admin', 'admin', 'content_manager')
  ));

CREATE POLICY "Content managers can manage help articles"
  ON help_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- System metrics policies
CREATE POLICY "Admins can view system metrics"
  ON system_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert metrics"
  ON system_metrics FOR INSERT
  WITH CHECK (true);

-- Moderation queue policies
CREATE POLICY "Admins can view moderation queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage moderation queue"
  ON moderation_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "System can insert into moderation queue"
  ON moderation_queue FOR INSERT
  WITH CHECK (true);

-- Announcements policies
CREATE POLICY "Active announcements are visible to target audience"
  ON announcements FOR SELECT
  USING (
    (active = true AND NOW() BETWEEN starts_at AND COALESCE(ends_at, 'infinity')) OR
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin')
    )
  );

-- Canned responses policies
CREATE POLICY "Support staff can view canned responses"
  ON canned_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'support_manager')
    )
  );

CREATE POLICY "Support staff can manage canned responses"
  ON canned_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'support_manager')
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  ticket_num TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num FROM support_tickets;
  ticket_num := '#' || LPAD(next_num::TEXT, 5, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER trigger_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_help_articles_updated_at
  BEFORE UPDATE ON help_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_canned_responses_updated_at
  BEFORE UPDATE ON canned_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO feature_flags (name, key, description, enabled, rollout_type) VALUES
  ('A/B Testing', 'enable_ab_testing', 'Enable A/B testing for share pages', false, 'percentage'),
  ('Custom Domains', 'enable_custom_domains', 'Allow Business plan users to add custom domains', true, 'plans'),
  ('Email Sequences', 'enable_email_sequences', 'Enable automated email sequences', true, 'all'),
  ('Advanced Analytics', 'enable_advanced_analytics', 'Enable advanced analytics features', true, 'plans')
ON CONFLICT (key) DO NOTHING;

-- Insert default canned responses
INSERT INTO canned_responses (title, category, shortcut, content, variables) VALUES
  ('Welcome Message', 'general', '/welcome', 'Hi {{user_name}},\n\nWelcome to ShareKit! I''m here to help you get started.\n\nHow can I assist you today?', ARRAY['user_name']),
  ('Billing - Refund Issued', 'billing', '/refund', 'Hi {{user_name}},\n\nI''ve processed a refund of {{refund_amount}} to your original payment method. You should see this in 5-7 business days.\n\nIs there anything else I can help with?', ARRAY['user_name', 'refund_amount']),
  ('Technical - Email Not Sending', 'technical', '/email-debug', 'Hi {{user_name}},\n\nI see the issue with your email delivery. Let''s troubleshoot:\n\n1. Check your Resend API key in Settings\n2. Verify your sending domain is authenticated\n3. Check the email delivery logs in your dashboard\n\nCan you let me know what you see?', ARRAY['user_name']),
  ('Account - Password Reset', 'account', '/password-reset', 'Hi {{user_name}},\n\nI''ve sent a password reset link to your email address. Please check your inbox and spam folder.\n\nThe link will expire in 1 hour.\n\nLet me know if you need any help!', ARRAY['user_name'])
ON CONFLICT (shortcut) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_users IS 'Admin users with role-based access control';
COMMENT ON TABLE admin_activity_log IS 'Audit log of all admin actions';
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON TABLE support_tickets IS 'Customer support ticket system';
COMMENT ON TABLE support_messages IS 'Messages within support tickets';
COMMENT ON TABLE blog_posts IS 'Blog posts for marketing and content';
COMMENT ON TABLE help_articles IS 'Help center articles and documentation';
COMMENT ON TABLE system_metrics IS 'Time-series system metrics for monitoring';
COMMENT ON TABLE moderation_queue IS 'Content moderation queue for flagged items';
COMMENT ON TABLE announcements IS 'Platform-wide announcements and notifications';
COMMENT ON TABLE canned_responses IS 'Pre-written responses for support tickets';
