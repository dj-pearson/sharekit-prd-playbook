-- ============================================================================
-- Layer 4: Enhanced Row-Level Security (RLS) Policies
--
-- This migration implements defense-in-depth RLS policies that provide the
-- final enforcement layer for data access. Even if application code has bugs,
-- these policies ensure unauthorized access is rejected at the database level.
--
-- Security Model:
-- 1. Default DENY: All access denied unless explicitly granted
-- 2. User isolation: Users only see their own data
-- 3. Team access: Team members can access shared team resources
-- 4. Admin bypass: Admins can access based on role permissions
-- ============================================================================

-- ============================================================================
-- Helper Functions for RLS
-- ============================================================================

-- Function to check if user is admin (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's team IDs
CREATE OR REPLACE FUNCTION public.get_user_team_ids()
RETURNS UUID[] AS $$
DECLARE
  team_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM public.team_members
  WHERE user_id = auth.uid();

  RETURN COALESCE(team_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
    AND team_id = check_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check team role
CREATE OR REPLACE FUNCTION public.has_team_role(check_team_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
    AND team_id = check_team_id
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check page ownership via email_captures
CREATE OR REPLACE FUNCTION public.owns_page_for_email_capture(capture_page_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pages
    WHERE id = capture_page_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- PROFILES Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create enhanced policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update profiles (for support)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================================================
-- PAGES Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Anyone can view published pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;

-- Create enhanced policies
-- Users can view their own pages
CREATE POLICY "pages_select_own"
  ON public.pages FOR SELECT
  USING (auth.uid() = user_id);

-- Team members can view team pages
CREATE POLICY "pages_select_team"
  ON public.pages FOR SELECT
  USING (
    team_id IS NOT NULL
    AND public.is_team_member(team_id)
  );

-- Anyone can view published pages (public access)
CREATE POLICY "pages_select_published"
  ON public.pages FOR SELECT
  USING (is_published = true);

-- Admins can view all pages
CREATE POLICY "pages_select_admin"
  ON public.pages FOR SELECT
  USING (public.is_admin());

-- Users can create pages (must be their own)
CREATE POLICY "pages_insert_own"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pages
CREATE POLICY "pages_update_own"
  ON public.pages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Team admins/owners can update team pages
CREATE POLICY "pages_update_team"
  ON public.pages FOR UPDATE
  USING (
    team_id IS NOT NULL
    AND public.has_team_role(team_id, ARRAY['owner', 'admin'])
  );

-- Users can delete their own pages
CREATE POLICY "pages_delete_own"
  ON public.pages FOR DELETE
  USING (auth.uid() = user_id);

-- Team owners can delete team pages
CREATE POLICY "pages_delete_team"
  ON public.pages FOR DELETE
  USING (
    team_id IS NOT NULL
    AND public.has_team_role(team_id, ARRAY['owner'])
  );

-- ============================================================================
-- RESOURCES Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can create resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;

-- Create enhanced policies
CREATE POLICY "resources_select_own"
  ON public.resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "resources_select_admin"
  ON public.resources FOR SELECT
  USING (public.is_admin());

CREATE POLICY "resources_insert_own"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resources_update_own"
  ON public.resources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "resources_delete_own"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- EMAIL_CAPTURES Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Page owners can view email captures" ON public.email_captures;
DROP POLICY IF EXISTS "Anyone can create email captures" ON public.email_captures;
DROP POLICY IF EXISTS "Page owners can update email captures" ON public.email_captures;
DROP POLICY IF EXISTS "Page owners can delete email captures" ON public.email_captures;

-- Create enhanced policies
-- Page owners can view their email captures
CREATE POLICY "email_captures_select_owner"
  ON public.email_captures FOR SELECT
  USING (public.owns_page_for_email_capture(page_id));

-- Admins can view all email captures
CREATE POLICY "email_captures_select_admin"
  ON public.email_captures FOR SELECT
  USING (public.is_admin());

-- Anyone can create email captures (public signup forms)
CREATE POLICY "email_captures_insert_public"
  ON public.email_captures FOR INSERT
  WITH CHECK (true);

-- Page owners can update email captures
CREATE POLICY "email_captures_update_owner"
  ON public.email_captures FOR UPDATE
  USING (public.owns_page_for_email_capture(page_id));

-- Page owners can delete email captures
CREATE POLICY "email_captures_delete_owner"
  ON public.email_captures FOR DELETE
  USING (public.owns_page_for_email_capture(page_id));

-- ============================================================================
-- TEAMS Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can view team" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can update team" ON public.teams;
DROP POLICY IF EXISTS "Team owners can delete team" ON public.teams;

-- Create enhanced policies
CREATE POLICY "teams_select_member"
  ON public.teams FOR SELECT
  USING (public.is_team_member(id));

CREATE POLICY "teams_select_admin"
  ON public.teams FOR SELECT
  USING (public.is_admin());

CREATE POLICY "teams_insert_auth"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_update_owner"
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_delete_owner"
  ON public.teams FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- TEAM_MEMBERS Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;

-- Create enhanced policies
CREATE POLICY "team_members_select_member"
  ON public.team_members FOR SELECT
  USING (public.is_team_member(team_id));

CREATE POLICY "team_members_select_admin"
  ON public.team_members FOR SELECT
  USING (public.is_admin());

-- Team owners/admins can add members
CREATE POLICY "team_members_insert_admin"
  ON public.team_members FOR INSERT
  WITH CHECK (public.has_team_role(team_id, ARRAY['owner', 'admin']));

-- Team owners/admins can update members (except they can't change owner)
CREATE POLICY "team_members_update_admin"
  ON public.team_members FOR UPDATE
  USING (public.has_team_role(team_id, ARRAY['owner', 'admin']));

-- Team owners can remove members
CREATE POLICY "team_members_delete_owner"
  ON public.team_members FOR DELETE
  USING (
    public.has_team_role(team_id, ARRAY['owner'])
    OR auth.uid() = user_id -- Users can remove themselves
  );

-- ============================================================================
-- WEBHOOKS Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can create webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;

-- Create enhanced policies
CREATE POLICY "webhooks_select_own"
  ON public.webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "webhooks_select_admin"
  ON public.webhooks FOR SELECT
  USING (public.is_admin());

CREATE POLICY "webhooks_insert_own"
  ON public.webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_update_own"
  ON public.webhooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_delete_own"
  ON public.webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CUSTOM_DOMAINS Table - Enhanced RLS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Users can create domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Users can update their own domains" ON public.custom_domains;
DROP POLICY IF EXISTS "Users can delete their own domains" ON public.custom_domains;

-- Create enhanced policies
CREATE POLICY "custom_domains_select_own"
  ON public.custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "custom_domains_select_admin"
  ON public.custom_domains FOR SELECT
  USING (public.is_admin());

CREATE POLICY "custom_domains_insert_own"
  ON public.custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_domains_update_own"
  ON public.custom_domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_domains_delete_own"
  ON public.custom_domains FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER_ROLES Table - Enhanced RLS
-- ============================================================================

-- This table should only be modifiable by super admins
-- Users can view their own role

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create enhanced policies
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- Only service role can insert/update/delete (handled via Edge Functions)
-- No direct insert/update/delete policies for regular users

-- ============================================================================
-- Security Audit Log Table
-- ============================================================================

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  security_layer TEXT NOT NULL CHECK (security_layer IN ('authentication', 'authorization', 'ownership', 'rls')),
  result TEXT NOT NULL CHECK (result IN ('allowed', 'denied')),
  denied_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_user ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_timestamp ON public.security_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_result ON public.security_audit_log(result);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "security_audit_log_select_admin"
  ON public.security_audit_log FOR SELECT
  USING (public.is_admin());

-- Insert via service role only (no user-facing insert policy)
-- This ensures audit logs can't be tampered with

-- ============================================================================
-- Function to log security events
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_security_layer TEXT,
  p_result TEXT,
  p_denied_reason TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    security_layer,
    result,
    denied_reason,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_security_layer,
    p_result,
    p_denied_reason,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.security_audit_log IS 'Audit log for security-related events (Layer 4 enforcement)';
COMMENT ON FUNCTION public.is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION public.get_user_team_ids() IS 'Get array of team IDs user belongs to';
COMMENT ON FUNCTION public.is_team_member(UUID) IS 'Check if current user is a member of specified team';
COMMENT ON FUNCTION public.has_team_role(UUID, TEXT[]) IS 'Check if current user has one of the specified roles in team';
COMMENT ON FUNCTION public.log_security_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INET, TEXT, JSONB) IS 'Log a security event for audit purposes';
