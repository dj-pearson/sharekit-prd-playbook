/**
 * Security Middleware Composer
 *
 * Combines all 4 security layers into a single composable check:
 * Layer 1: Authentication (WHO are you?)
 * Layer 2: Authorization (WHAT can you do?)
 * Layer 3: Resource Ownership (IS this yours?)
 * Layer 4: Database RLS (FINAL enforcement - handled by Supabase)
 */

import { checkAuthentication, type AuthCheckOptions } from './authentication';
import { checkAuthorization, type AuthorizationCheckOptions } from './authorization';
import { checkOwnership, type OwnershipCheckOptions } from './ownership';
import type {
  SecurityCheckResult,
  SecurityMiddlewareConfig,
  DEFAULT_SECURITY_CONFIG,
} from './types';

// ============================================================================
// Security Check Composer
// ============================================================================

/**
 * Compose multiple security checks into a single function
 * Checks are executed in order: Authentication -> Authorization -> Ownership
 */
export async function runSecurityChecks(
  config: SecurityMiddlewareConfig
): Promise<SecurityCheckResult> {
  // Layer 1: Authentication
  if (config.requireAuth !== false) {
    const authResult = await checkAuthentication({
      requireAuth: config.requireAuth ?? true,
      requireEmailVerified: config.requireEmailVerified,
      requireOnboardingComplete: config.requireOnboardingComplete,
    });

    if (!authResult.allowed) {
      return authResult;
    }
  }

  // Layer 2: Authorization
  const hasAuthorizationRequirements =
    config.requiredPermissions?.length ||
    config.requiredAnyPermission?.length ||
    config.minimumRoleLevel !== undefined ||
    config.allowedRoles?.length;

  if (hasAuthorizationRequirements) {
    const authzResult = await checkAuthorization({
      requiredPermissions: config.requiredPermissions,
      requiredAnyPermission: config.requiredAnyPermission,
      minimumRoleLevel: config.minimumRoleLevel,
      allowedRoles: config.allowedRoles,
    });

    if (!authzResult.allowed) {
      return authzResult;
    }
  }

  // Layer 3: Resource Ownership (if resource config is provided)
  // Note: resourceId must be provided at runtime, not in static config
  // This layer is typically checked separately when the resourceId is known

  // All checks passed
  return {
    allowed: true,
    layer: 'authorization', // Last checked layer
  };
}

/**
 * Check resource ownership (Layer 3)
 * This is separated because resourceId is often only known at runtime
 */
export async function runOwnershipCheck(
  resourceType: string,
  resourceId: string,
  options: {
    allowTeamAccess?: boolean;
    requiredTeamRoles?: ('owner' | 'admin' | 'member')[];
  } = {}
): Promise<SecurityCheckResult> {
  return checkOwnership({
    resourceType,
    resourceId,
    allowTeamAccess: options.allowTeamAccess,
    requiredTeamRoles: options.requiredTeamRoles,
  });
}

/**
 * Full security check including ownership
 */
export async function runFullSecurityCheck(
  config: SecurityMiddlewareConfig,
  resourceId?: string
): Promise<SecurityCheckResult> {
  // Run authentication and authorization checks
  const baseResult = await runSecurityChecks(config);
  if (!baseResult.allowed) {
    return baseResult;
  }

  // Run ownership check if configured and resourceId is provided
  if (config.resourceOwnership && resourceId) {
    const ownershipResult = await runOwnershipCheck(
      config.resourceOwnership.resourceType,
      resourceId,
      {
        allowTeamAccess: config.resourceOwnership.allowTeamAccess,
      }
    );

    if (!ownershipResult.allowed) {
      return ownershipResult;
    }
  }

  return {
    allowed: true,
    layer: 'ownership',
  };
}

// ============================================================================
// Predefined Security Configurations
// ============================================================================

/**
 * Common security configurations for different route types
 */
export const SECURITY_CONFIGS = {
  /**
   * Public routes - no authentication required
   */
  public: {
    requireAuth: false,
  } as SecurityMiddlewareConfig,

  /**
   * Authenticated routes - just need to be logged in
   */
  authenticated: {
    requireAuth: true,
  } as SecurityMiddlewareConfig,

  /**
   * Dashboard routes - authenticated with basic permissions
   */
  dashboard: {
    requireAuth: true,
    requireOnboardingComplete: true,
  } as SecurityMiddlewareConfig,

  /**
   * Pages management - requires page permissions
   */
  pagesManagement: {
    requireAuth: true,
    requiredAnyPermission: ['pages.view_own', 'pages.view_team', 'pages.view_all'],
    resourceOwnership: {
      resourceType: 'pages',
      allowTeamAccess: true,
    },
  } as SecurityMiddlewareConfig,

  /**
   * Resources management
   */
  resourcesManagement: {
    requireAuth: true,
    requiredPermissions: ['resources.view_own'],
    resourceOwnership: {
      resourceType: 'resources',
      allowTeamAccess: false,
    },
  } as SecurityMiddlewareConfig,

  /**
   * Analytics viewing
   */
  analytics: {
    requireAuth: true,
    requiredAnyPermission: ['analytics.view_own', 'analytics.view_team', 'analytics.view_all'],
  } as SecurityMiddlewareConfig,

  /**
   * Webhooks management - pro feature
   */
  webhooks: {
    requireAuth: true,
    requiredPermissions: ['webhooks.view'],
    requiredSubscription: ['pro', 'business'],
    resourceOwnership: {
      resourceType: 'webhooks',
      allowTeamAccess: false,
    },
  } as SecurityMiddlewareConfig,

  /**
   * Custom domains - business feature
   */
  customDomains: {
    requireAuth: true,
    requiredPermissions: ['domains.view'],
    requiredSubscription: ['business'],
    resourceOwnership: {
      resourceType: 'custom_domains',
      allowTeamAccess: false,
    },
  } as SecurityMiddlewareConfig,

  /**
   * Team management
   */
  teamManagement: {
    requireAuth: true,
    requiredPermissions: ['teams.view'],
    resourceOwnership: {
      resourceType: 'teams',
      allowTeamAccess: true,
    },
  } as SecurityMiddlewareConfig,

  /**
   * Admin access
   */
  admin: {
    requireAuth: true,
    requiredPermissions: ['admin.access'],
    minimumRoleLevel: 4, // admin or super_admin
  } as SecurityMiddlewareConfig,

  /**
   * Super admin only
   */
  superAdmin: {
    requireAuth: true,
    allowedRoles: ['super_admin'],
    minimumRoleLevel: 5,
  } as SecurityMiddlewareConfig,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a custom security configuration
 */
export function createSecurityConfig(
  base: keyof typeof SECURITY_CONFIGS | SecurityMiddlewareConfig,
  overrides: Partial<SecurityMiddlewareConfig> = {}
): SecurityMiddlewareConfig {
  const baseConfig = typeof base === 'string' ? SECURITY_CONFIGS[base] : base;
  return {
    ...baseConfig,
    ...overrides,
    // Merge arrays properly
    requiredPermissions: [
      ...(baseConfig.requiredPermissions || []),
      ...(overrides.requiredPermissions || []),
    ],
    requiredAnyPermission: [
      ...(baseConfig.requiredAnyPermission || []),
      ...(overrides.requiredAnyPermission || []),
    ],
    allowedRoles: [
      ...(baseConfig.allowedRoles || []),
      ...(overrides.allowedRoles || []),
    ],
    // Override resource ownership if provided
    resourceOwnership: overrides.resourceOwnership || baseConfig.resourceOwnership,
  };
}

/**
 * Get human-readable error message for a security check result
 */
export function getSecurityErrorMessage(result: SecurityCheckResult): string {
  if (result.allowed) return '';

  switch (result.deniedReason) {
    case 'not_authenticated':
      return 'Please sign in to continue.';
    case 'email_not_verified':
      return 'Please verify your email address to continue.';
    case 'onboarding_incomplete':
      return 'Please complete your profile setup to continue.';
    case 'insufficient_permissions':
      return 'You do not have permission to perform this action.';
    case 'insufficient_role_level':
      return 'Your account type does not have access to this feature.';
    case 'not_resource_owner':
      return 'You do not have access to this resource.';
    case 'not_team_member':
      return 'You are not a member of this team.';
    case 'subscription_limit_reached':
      return 'This feature requires an upgraded subscription plan.';
    case 'rls_denied':
      return 'Access denied by database security policy.';
    default:
      return result.details || 'Access denied.';
  }
}

/**
 * Get appropriate redirect path for a security check result
 */
export function getSecurityRedirectPath(
  result: SecurityCheckResult,
  defaultPath: string = '/dashboard'
): string {
  if (result.allowed) return defaultPath;

  switch (result.deniedReason) {
    case 'not_authenticated':
      return '/auth';
    case 'email_not_verified':
      return '/auth?verify=true';
    case 'onboarding_incomplete':
      return '/onboarding';
    case 'subscription_limit_reached':
      return '/pricing';
    default:
      return defaultPath;
  }
}
