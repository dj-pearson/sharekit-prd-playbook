/**
 * Layer 3: Resource Ownership
 *
 * Handles resource ownership verification:
 * - Direct ownership (user_id = current user)
 * - Team ownership (team_id in user's teams)
 * - Tenant isolation (multi-tenancy support)
 */

import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './authentication';
import type { SecurityCheckResult, ResourceOwnership } from './types';

// ============================================================================
// Resource Configuration
// ============================================================================

/**
 * Configuration for how ownership is determined for each resource type
 */
export interface ResourceConfig {
  table: string;
  userColumn: string;
  teamColumn?: string;
  tenantColumn?: string;
  /** For resources owned indirectly (e.g., email_captures via pages) */
  indirectOwnership?: {
    throughTable: string;
    throughColumn: string;
    foreignKey: string;
  };
}

export const RESOURCE_CONFIGS: Record<string, ResourceConfig> = {
  pages: {
    table: 'pages',
    userColumn: 'user_id',
    teamColumn: 'team_id',
  },
  resources: {
    table: 'resources',
    userColumn: 'user_id',
  },
  email_captures: {
    table: 'email_captures',
    userColumn: 'user_id', // Will be checked via page ownership
    indirectOwnership: {
      throughTable: 'pages',
      throughColumn: 'user_id',
      foreignKey: 'page_id',
    },
  },
  webhooks: {
    table: 'webhooks',
    userColumn: 'user_id',
  },
  custom_domains: {
    table: 'custom_domains',
    userColumn: 'user_id',
  },
  teams: {
    table: 'teams',
    userColumn: 'owner_id',
  },
  team_members: {
    table: 'team_members',
    userColumn: 'user_id',
    teamColumn: 'team_id',
  },
  profiles: {
    table: 'profiles',
    userColumn: 'id', // Profile ID is the user ID
  },
};

// ============================================================================
// Team Membership
// ============================================================================

/**
 * Get all team IDs that a user belongs to
 */
export async function getUserTeamIds(userId: string): Promise<string[]> {
  try {
    const { data: memberships, error } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user teams:', error);
      return [];
    }

    return memberships?.map((m) => m.team_id) || [];
  } catch (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
}

/**
 * Check if user is a member of a specific team
 */
export async function isTeamMember(userId: string, teamId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user has a specific role in a team
 */
export async function hasTeamRole(
  userId: string,
  teamId: string,
  roles: ('owner' | 'admin' | 'member')[]
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .single();

    if (error || !data) return false;
    return roles.includes(data.role as 'owner' | 'admin' | 'member');
  } catch (error) {
    return false;
  }
}

// ============================================================================
// Direct Ownership Checks
// ============================================================================

/**
 * Check if user directly owns a resource
 */
export async function isResourceOwner(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  const config = RESOURCE_CONFIGS[resourceType];
  if (!config) {
    console.error(`Unknown resource type: ${resourceType}`);
    return false;
  }

  try {
    // Handle indirect ownership (e.g., email_captures via pages)
    if (config.indirectOwnership) {
      const { throughTable, throughColumn, foreignKey } = config.indirectOwnership;

      // First, get the foreign key value from the resource
      const { data: resource, error: resourceError } = await supabase
        .from(config.table)
        .select(foreignKey)
        .eq('id', resourceId)
        .single();

      if (resourceError || !resource) return false;

      // Then check ownership through the related table
      const { data: owner, error: ownerError } = await supabase
        .from(throughTable)
        .select('id')
        .eq('id', resource[foreignKey])
        .eq(throughColumn, userId)
        .single();

      return !ownerError && !!owner;
    }

    // Direct ownership check
    const { data, error } = await supabase
      .from(config.table)
      .select('id')
      .eq('id', resourceId)
      .eq(config.userColumn, userId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error(`Error checking ownership for ${resourceType}:`, error);
    return false;
  }
}

/**
 * Check if user owns resource through team membership
 */
export async function isTeamResourceOwner(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  const config = RESOURCE_CONFIGS[resourceType];
  if (!config || !config.teamColumn) {
    return false;
  }

  try {
    // Get the resource's team ID
    const { data: resource, error: resourceError } = await supabase
      .from(config.table)
      .select(config.teamColumn)
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource || !resource[config.teamColumn]) {
      return false;
    }

    // Check if user is a member of that team
    return isTeamMember(userId, resource[config.teamColumn]);
  } catch (error) {
    console.error(`Error checking team ownership for ${resourceType}:`, error);
    return false;
  }
}

// ============================================================================
// Ownership Verification Functions (return SecurityCheckResult)
// ============================================================================

/**
 * Require direct ownership of a resource
 */
export async function requireOwnership(
  resourceType: string,
  resourceId: string
): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const isOwner = await isResourceOwner(resourceType, resourceId, user.id);

  if (!isOwner) {
    return {
      allowed: false,
      deniedReason: 'not_resource_owner',
      layer: 'ownership',
      details: `User does not own ${resourceType} with ID ${resourceId}`,
    };
  }

  return {
    allowed: true,
    layer: 'ownership',
  };
}

/**
 * Require ownership through direct ownership OR team membership
 */
export async function requireOwnershipOrTeam(
  resourceType: string,
  resourceId: string
): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  // Check direct ownership first
  const isOwner = await isResourceOwner(resourceType, resourceId, user.id);
  if (isOwner) {
    return {
      allowed: true,
      layer: 'ownership',
    };
  }

  // Check team ownership
  const isTeamOwner = await isTeamResourceOwner(resourceType, resourceId, user.id);
  if (isTeamOwner) {
    return {
      allowed: true,
      layer: 'ownership',
    };
  }

  return {
    allowed: false,
    deniedReason: 'not_resource_owner',
    layer: 'ownership',
    details: `User does not own ${resourceType} with ID ${resourceId} (direct or via team)`,
  };
}

/**
 * Require team membership for a specific team
 */
export async function requireTeamMembership(teamId: string): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const isMember = await isTeamMember(user.id, teamId);

  if (!isMember) {
    return {
      allowed: false,
      deniedReason: 'not_team_member',
      layer: 'ownership',
      details: `User is not a member of team ${teamId}`,
    };
  }

  return {
    allowed: true,
    layer: 'ownership',
  };
}

/**
 * Require specific team role
 */
export async function requireTeamRole(
  teamId: string,
  roles: ('owner' | 'admin' | 'member')[]
): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const hasRole = await hasTeamRole(user.id, teamId, roles);

  if (!hasRole) {
    return {
      allowed: false,
      deniedReason: 'not_team_member',
      layer: 'ownership',
      details: `User does not have required role (${roles.join(', ')}) in team ${teamId}`,
    };
  }

  return {
    allowed: true,
    layer: 'ownership',
  };
}

// ============================================================================
// Combined Ownership Check
// ============================================================================

export interface OwnershipCheckOptions {
  resourceType: string;
  resourceId: string;
  allowTeamAccess?: boolean;
  requiredTeamRoles?: ('owner' | 'admin' | 'member')[];
}

/**
 * Perform ownership check based on options
 */
export async function checkOwnership(options: OwnershipCheckOptions): Promise<SecurityCheckResult> {
  const { resourceType, resourceId, allowTeamAccess = false, requiredTeamRoles } = options;

  const user = await getCurrentUser();
  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  // Check direct ownership
  const isOwner = await isResourceOwner(resourceType, resourceId, user.id);
  if (isOwner) {
    return {
      allowed: true,
      layer: 'ownership',
    };
  }

  // Check team access if allowed
  if (allowTeamAccess) {
    const config = RESOURCE_CONFIGS[resourceType];
    if (config?.teamColumn) {
      // Get resource's team ID
      const { data: resource } = await supabase
        .from(config.table)
        .select(config.teamColumn)
        .eq('id', resourceId)
        .single();

      if (resource?.[config.teamColumn]) {
        const teamId = resource[config.teamColumn];

        // If specific roles are required, check those
        if (requiredTeamRoles && requiredTeamRoles.length > 0) {
          const hasRole = await hasTeamRole(user.id, teamId, requiredTeamRoles);
          if (hasRole) {
            return {
              allowed: true,
              layer: 'ownership',
            };
          }
        } else {
          // Just check membership
          const isMember = await isTeamMember(user.id, teamId);
          if (isMember) {
            return {
              allowed: true,
              layer: 'ownership',
            };
          }
        }
      }
    }
  }

  return {
    allowed: false,
    deniedReason: 'not_resource_owner',
    layer: 'ownership',
    details: `User does not have access to ${resourceType} with ID ${resourceId}`,
  };
}

// ============================================================================
// Filtered Query Helpers
// ============================================================================

/**
 * Add ownership filter to a Supabase query
 * This ensures users only see resources they own or have team access to
 */
export function addOwnershipFilter<T>(
  query: any, // Supabase query builder
  resourceType: string,
  userId: string,
  teamIds: string[] = [],
  includeTeam: boolean = false
): any {
  const config = RESOURCE_CONFIGS[resourceType];
  if (!config) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }

  if (includeTeam && config.teamColumn && teamIds.length > 0) {
    // User owns OR is in the team
    return query.or(`${config.userColumn}.eq.${userId},${config.teamColumn}.in.(${teamIds.join(',')})`);
  }

  // Just user ownership
  return query.eq(config.userColumn, userId);
}

/**
 * Get ownership context for current user
 */
export async function getOwnershipContext(): Promise<{
  userId: string | null;
  teamIds: string[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { userId: null, teamIds: [] };
  }

  const teamIds = await getUserTeamIds(user.id);
  return { userId: user.id, teamIds };
}

// ============================================================================
// Error Messages
// ============================================================================

export function getOwnershipErrorMessage(deniedReason?: string): string {
  switch (deniedReason) {
    case 'not_resource_owner':
      return 'You do not have access to this resource.';
    case 'not_team_member':
      return 'You are not a member of this team.';
    default:
      return 'You do not have permission to access this resource.';
  }
}
