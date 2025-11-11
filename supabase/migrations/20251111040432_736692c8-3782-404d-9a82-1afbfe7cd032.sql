-- Drop existing problematic policies
DROP POLICY IF EXISTS "Team owners and admins can add members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners and admins can update members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view members of their teams" ON public.team_members;

-- Create security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND team_id = _team_id
  )
$$;

-- Create security definer function to check if user is team admin/owner
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND team_id = _team_id
      AND role IN ('owner', 'admin')
  )
$$;

-- Recreate RLS policies using security definer functions
CREATE POLICY "Users can view members of their teams"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can add members"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can update members"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can remove members"
  ON public.team_members
  FOR DELETE
  TO authenticated
  USING (public.is_team_admin(auth.uid(), team_id));