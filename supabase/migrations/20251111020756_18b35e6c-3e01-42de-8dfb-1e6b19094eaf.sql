-- Create app_role enum for team roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member');

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger to teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for teams
CREATE POLICY "Users can view teams they are members of"
  ON public.teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON public.teams
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
  ON public.teams
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
  ON public.teams
  FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Users can view members of their teams"
  ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can add members"
  ON public.team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can update members"
  ON public.team_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can remove members"
  ON public.team_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations"
  ON public.team_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
    ) OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team owners and admins can create invitations"
  ON public.team_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can delete invitations"
  ON public.team_invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Add team_id to pages table
ALTER TABLE public.pages ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Update pages RLS policies to support team access
DROP POLICY "Users can view their own pages" ON public.pages;
DROP POLICY "Users can create pages" ON public.pages;
DROP POLICY "Users can update their own pages" ON public.pages;
DROP POLICY "Users can delete their own pages" ON public.pages;

CREATE POLICY "Users can view their own pages or team pages"
  ON public.pages
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_published = true
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = pages.team_id
        AND team_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create pages"
  ON public.pages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      team_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = pages.team_id
        AND team_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own pages or team pages with permission"
  ON public.pages
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = pages.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "Users can delete their own pages or team pages with permission"
  ON public.pages
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = pages.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );

-- Add team_id to resources table
ALTER TABLE public.resources ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Update resources RLS policies to support team access
DROP POLICY "Users can view their own resources" ON public.resources;
DROP POLICY "Users can create resources" ON public.resources;
DROP POLICY "Users can update their own resources" ON public.resources;
DROP POLICY "Users can delete their own resources" ON public.resources;

CREATE POLICY "Users can view their own resources or team resources"
  ON public.resources
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = resources.team_id
        AND team_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create resources"
  ON public.resources
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      team_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = resources.team_id
        AND team_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own resources or team resources with permission"
  ON public.resources
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = resources.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "Users can delete their own resources or team resources with permission"
  ON public.resources
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR (
      team_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_members.team_id = resources.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );

-- Function to automatically add team owner as member
CREATE OR REPLACE FUNCTION public.add_team_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_owner_as_member();