/**
 * Layer 2: Authorization
 *
 * Handles permission and role-based access control:
 * - Permission checks (e.g., 'pages.create', 'resources.delete_own')
 * - Role-level hierarchical checks
 * - Subscription-based feature gating
 */

import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './authentication';
import type {
  UserRole,
  PermissionValue,
  SecurityCheckResult,
  SecurityContext,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  PERMISSIONS,
} from './types';

// Re-export for convenience
export { PERMISSIONS, ROLE_LEVELS, ROLE_PERMISSIONS } from './types';

// ============================================================================
// User Role Resolution
// ============================================================================

/**
 * Get the user's role based on their profile and roles table
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    // Check admin role first
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (adminRole) {
      return 'admin';
    }

    // Check subscription for pro_user status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', userId)
      .single();

    if (profile?.subscription_plan === 'business' || profile?.subscription_plan === 'pro') {
      // Check if they are a team admin
      const { data: teamMembership } = await supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['owner', 'admin'])
        .limit(1);

      if (teamMembership && teamMembership.length > 0) {
        return 'team_admin';
      }

      return 'pro_user';
    }

    // Check if user has a valid session (basic user)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return 'user';
    }

    return 'guest';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'guest';
  }
}

/**
 * Get the numeric level for a role
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    pro_user: 2,
    team_admin: 3,
    admin: 4,
    super_admin: 5,
  };
  return levels[role] ?? 0;
}

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Get all permissions for a user role
 */
export function getPermissionsForRole(role: UserRole): PermissionValue[] {
  const rolePermissions: Record<UserRole, PermissionValue[]> = {
    guest: [],
    user: [
      'pages.view_own',
      'pages.create',
      'pages.edit_own',
      'pages.delete_own',
      'pages.publish',
      'resources.view_own',
      'resources.create',
      'resources.edit_own',
      'resources.delete_own',
      'analytics.view_own',
      'email_captures.view_own',
      'settings.view',
      'settings.edit',
    ] as PermissionValue[],
    pro_user: [
      'pages.view_own',
      'pages.create',
      'pages.edit_own',
      'pages.delete_own',
      'pages.publish',
      'resources.view_own',
      'resources.create',
      'resources.edit_own',
      'resources.delete_own',
      'analytics.view_own',
      'analytics.export',
      'email_captures.view_own',
      'email_captures.export',
      'webhooks.view',
      'webhooks.create',
      'webhooks.manage',
      'webhooks.delete',
      'domains.view',
      'domains.create',
      'domains.manage',
      'domains.delete',
      'settings.view',
      'settings.edit',
      'settings.billing',
    ] as PermissionValue[],
    team_admin: [
      'pages.view_own',
      'pages.view_team',
      'pages.create',
      'pages.edit_own',
      'pages.edit_team',
      'pages.delete_own',
      'pages.delete_team',
      'pages.publish',
      'resources.view_own',
      'resources.view_team',
      'resources.create',
      'resources.edit_own',
      'resources.delete_own',
      'resources.delete_team',
      'analytics.view_own',
      'analytics.view_team',
      'analytics.export',
      'email_captures.view_own',
      'email_captures.view_team',
      'email_captures.export',
      'teams.view',
      'teams.create',
      'teams.manage',
      'teams.invite',
      'webhooks.view',
      'webhooks.create',
      'webhooks.manage',
      'webhooks.delete',
      'domains.view',
      'domains.create',
      'domains.manage',
      'domains.delete',
      'settings.view',
      'settings.edit',
      'settings.billing',
    ] as PermissionValue[],
    admin: [
      'pages.view_own',
      'pages.view_team',
      'pages.view_all',
      'pages.create',
      'pages.edit_own',
      'pages.edit_team',
      'pages.edit_all',
      'pages.delete_own',
      'pages.delete_team',
      'pages.delete_all',
      'pages.publish',
      'resources.view_own',
      'resources.view_team',
      'resources.create',
      'resources.edit_own',
      'resources.delete_own',
      'resources.delete_team',
      'analytics.view_own',
      'analytics.view_team',
      'analytics.view_all',
      'analytics.export',
      'email_captures.view_own',
      'email_captures.view_team',
      'email_captures.export',
      'teams.view',
      'teams.create',
      'teams.manage',
      'teams.delete',
      'teams.invite',
      'webhooks.view',
      'webhooks.create',
      'webhooks.manage',
      'webhooks.delete',
      'domains.view',
      'domains.create',
      'domains.manage',
      'domains.delete',
      'settings.view',
      'settings.edit',
      'settings.billing',
      'admin.access',
      'admin.users.view',
      'admin.users.edit',
      'admin.content.moderate',
    ] as PermissionValue[],
    super_admin: [], // Handled by wildcard check
  };

  return rolePermissions[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: PermissionValue): boolean {
  // Super admin has all permissions
  if (role === 'super_admin') {
    return true;
  }

  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(permission: PermissionValue): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = await getUserRole(user.id);
  return roleHasPermission(role, permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: PermissionValue[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = await getUserRole(user.id);

  // Super admin has all permissions
  if (role === 'super_admin') return true;

  const userPermissions = getPermissionsForRole(role);
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: PermissionValue[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = await getUserRole(user.id);

  // Super admin has all permissions
  if (role === 'super_admin') return true;

  const userPermissions = getPermissionsForRole(role);
  return permissions.every((p) => userPermissions.includes(p));
}

// ============================================================================
// Role Level Checking
// ============================================================================

/**
 * Check if user meets minimum role level requirement
 */
export async function meetsRoleLevel(minimumLevel: number): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = await getUserRole(user.id);
  const userLevel = getRoleLevel(role);

  return userLevel >= minimumLevel;
}

/**
 * Check if user has one of the allowed roles
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = await getUserRole(user.id);
  return allowedRoles.includes(role);
}

// ============================================================================
// Authorization Check Functions (return SecurityCheckResult)
// ============================================================================

/**
 * Require a specific permission
 */
export async function requirePermission(permission: PermissionValue): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const allowed = await hasPermission(permission);

  if (!allowed) {
    return {
      allowed: false,
      deniedReason: 'insufficient_permissions',
      layer: 'authorization',
      details: `Missing required permission: ${permission}`,
    };
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissions: PermissionValue[]): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const allowed = await hasAnyPermission(permissions);

  if (!allowed) {
    return {
      allowed: false,
      deniedReason: 'insufficient_permissions',
      layer: 'authorization',
      details: `Missing required permissions. Need one of: ${permissions.join(', ')}`,
    };
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

/**
 * Require all of the specified permissions
 */
export async function requireAllPermissions(permissions: PermissionValue[]): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const allowed = await hasAllPermissions(permissions);

  if (!allowed) {
    return {
      allowed: false,
      deniedReason: 'insufficient_permissions',
      layer: 'authorization',
      details: `Missing required permissions: ${permissions.join(', ')}`,
    };
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

/**
 * Require minimum role level
 */
export async function requireRoleLevel(minimumLevel: number): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const allowed = await meetsRoleLevel(minimumLevel);

  if (!allowed) {
    const role = await getUserRole(user.id);
    const userLevel = getRoleLevel(role);
    return {
      allowed: false,
      deniedReason: 'insufficient_role_level',
      layer: 'authorization',
      details: `Role level ${userLevel} does not meet minimum requirement of ${minimumLevel}`,
    };
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

/**
 * Require one of the specified roles
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  const allowed = await hasRole(allowedRoles);

  if (!allowed) {
    const role = await getUserRole(user.id);
    return {
      allowed: false,
      deniedReason: 'insufficient_role_level',
      layer: 'authorization',
      details: `Role '${role}' is not in allowed roles: ${allowedRoles.join(', ')}`,
    };
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

// ============================================================================
// Combined Authorization Check
// ============================================================================

export interface AuthorizationCheckOptions {
  requiredPermissions?: PermissionValue[];
  requiredAnyPermission?: PermissionValue[];
  minimumRoleLevel?: number;
  allowedRoles?: UserRole[];
}

/**
 * Perform all authorization checks based on options
 */
export async function checkAuthorization(
  options: AuthorizationCheckOptions
): Promise<SecurityCheckResult> {
  // Check required permissions (all must be present)
  if (options.requiredPermissions && options.requiredPermissions.length > 0) {
    const result = await requireAllPermissions(options.requiredPermissions);
    if (!result.allowed) return result;
  }

  // Check any permission (at least one must be present)
  if (options.requiredAnyPermission && options.requiredAnyPermission.length > 0) {
    const result = await requireAnyPermission(options.requiredAnyPermission);
    if (!result.allowed) return result;
  }

  // Check minimum role level
  if (options.minimumRoleLevel !== undefined) {
    const result = await requireRoleLevel(options.minimumRoleLevel);
    if (!result.allowed) return result;
  }

  // Check allowed roles
  if (options.allowedRoles && options.allowedRoles.length > 0) {
    const result = await requireRole(options.allowedRoles);
    if (!result.allowed) return result;
  }

  return {
    allowed: true,
    layer: 'authorization',
  };
}

// ============================================================================
// Error Messages
// ============================================================================

export function getAuthorizationErrorMessage(details?: string): string {
  if (details?.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  if (details?.includes('role')) {
    return 'Your account type does not have access to this feature.';
  }
  return 'You are not authorized to access this resource.';
}
