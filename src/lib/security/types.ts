/**
 * Security Types and Constants
 *
 * Defense-in-Depth Security Model:
 *
 * Layer 1: Authentication (WHO are you?)
 *   - Validates JWT/session is valid
 *   - Ensures user identity is confirmed
 *
 * Layer 2: Authorization (WHAT can you do?)
 *   - Role-based access control (RBAC)
 *   - Permission checks (e.g., 'pages.create', 'resources.delete')
 *   - Role level checks (roleLevel >= required)
 *
 * Layer 3: Resource Ownership (IS this yours?)
 *   - Tenant filtering (tenantId = user's tenantId)
 *   - Owner checks (createdBy = userId for "own" access)
 *
 * Layer 4: Database RLS (FINAL enforcement)
 *   - Row-level security policies in PostgreSQL
 *   - Even if code has bugs, DB rejects unauthorized access
 */

import type { User } from '@supabase/supabase-js';

// ============================================================================
// Authentication Types (Layer 1)
// ============================================================================

export interface AuthState {
  user: User | null;
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthRequirement {
  requireAuth: boolean;
  requireEmailVerified?: boolean;
  requireOnboardingComplete?: boolean;
}

// ============================================================================
// Authorization Types (Layer 2)
// ============================================================================

/**
 * User roles with hierarchical levels
 * Higher level = more permissions
 */
export type UserRole = 'guest' | 'user' | 'pro_user' | 'team_admin' | 'admin' | 'super_admin';

export const ROLE_LEVELS: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  pro_user: 2,
  team_admin: 3,
  admin: 4,
  super_admin: 5,
};

/**
 * Permission categories and actions
 * Format: 'resource.action' or 'resource.action_scope'
 */
export type PermissionScope = 'own' | 'team' | 'all';

export interface Permission {
  resource: string;
  action: string;
  scope?: PermissionScope;
}

/**
 * Standard permissions for the application
 */
export const PERMISSIONS = {
  // Pages
  PAGES_VIEW_OWN: 'pages.view_own',
  PAGES_VIEW_TEAM: 'pages.view_team',
  PAGES_VIEW_ALL: 'pages.view_all',
  PAGES_CREATE: 'pages.create',
  PAGES_EDIT_OWN: 'pages.edit_own',
  PAGES_EDIT_TEAM: 'pages.edit_team',
  PAGES_EDIT_ALL: 'pages.edit_all',
  PAGES_DELETE_OWN: 'pages.delete_own',
  PAGES_DELETE_TEAM: 'pages.delete_team',
  PAGES_DELETE_ALL: 'pages.delete_all',
  PAGES_PUBLISH: 'pages.publish',

  // Resources
  RESOURCES_VIEW_OWN: 'resources.view_own',
  RESOURCES_VIEW_TEAM: 'resources.view_team',
  RESOURCES_CREATE: 'resources.create',
  RESOURCES_EDIT_OWN: 'resources.edit_own',
  RESOURCES_DELETE_OWN: 'resources.delete_own',
  RESOURCES_DELETE_TEAM: 'resources.delete_team',

  // Analytics
  ANALYTICS_VIEW_OWN: 'analytics.view_own',
  ANALYTICS_VIEW_TEAM: 'analytics.view_team',
  ANALYTICS_VIEW_ALL: 'analytics.view_all',
  ANALYTICS_EXPORT: 'analytics.export',

  // Teams
  TEAMS_VIEW: 'teams.view',
  TEAMS_CREATE: 'teams.create',
  TEAMS_MANAGE: 'teams.manage',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_INVITE: 'teams.invite',

  // Email Captures
  EMAIL_CAPTURES_VIEW_OWN: 'email_captures.view_own',
  EMAIL_CAPTURES_VIEW_TEAM: 'email_captures.view_team',
  EMAIL_CAPTURES_EXPORT: 'email_captures.export',

  // Webhooks
  WEBHOOKS_VIEW: 'webhooks.view',
  WEBHOOKS_CREATE: 'webhooks.create',
  WEBHOOKS_MANAGE: 'webhooks.manage',
  WEBHOOKS_DELETE: 'webhooks.delete',

  // Custom Domains
  DOMAINS_VIEW: 'domains.view',
  DOMAINS_CREATE: 'domains.create',
  DOMAINS_MANAGE: 'domains.manage',
  DOMAINS_DELETE: 'domains.delete',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_BILLING: 'settings.billing',

  // Admin
  ADMIN_ACCESS: 'admin.access',
  ADMIN_USERS_VIEW: 'admin.users.view',
  ADMIN_USERS_EDIT: 'admin.users.edit',
  ADMIN_USERS_DELETE: 'admin.users.delete',
  ADMIN_CONTENT_MODERATE: 'admin.content.moderate',
  ADMIN_SETTINGS: 'admin.settings',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

/**
 * Role-to-permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionValue[]> = {
  guest: [],

  user: [
    PERMISSIONS.PAGES_VIEW_OWN,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT_OWN,
    PERMISSIONS.PAGES_DELETE_OWN,
    PERMISSIONS.PAGES_PUBLISH,
    PERMISSIONS.RESOURCES_VIEW_OWN,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_EDIT_OWN,
    PERMISSIONS.RESOURCES_DELETE_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_OWN,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],

  pro_user: [
    // All user permissions
    PERMISSIONS.PAGES_VIEW_OWN,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT_OWN,
    PERMISSIONS.PAGES_DELETE_OWN,
    PERMISSIONS.PAGES_PUBLISH,
    PERMISSIONS.RESOURCES_VIEW_OWN,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_EDIT_OWN,
    PERMISSIONS.RESOURCES_DELETE_OWN,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_OWN,
    PERMISSIONS.EMAIL_CAPTURES_EXPORT,
    PERMISSIONS.WEBHOOKS_VIEW,
    PERMISSIONS.WEBHOOKS_CREATE,
    PERMISSIONS.WEBHOOKS_MANAGE,
    PERMISSIONS.WEBHOOKS_DELETE,
    PERMISSIONS.DOMAINS_VIEW,
    PERMISSIONS.DOMAINS_CREATE,
    PERMISSIONS.DOMAINS_MANAGE,
    PERMISSIONS.DOMAINS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_BILLING,
  ],

  team_admin: [
    // All pro_user permissions plus team permissions
    PERMISSIONS.PAGES_VIEW_OWN,
    PERMISSIONS.PAGES_VIEW_TEAM,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT_OWN,
    PERMISSIONS.PAGES_EDIT_TEAM,
    PERMISSIONS.PAGES_DELETE_OWN,
    PERMISSIONS.PAGES_DELETE_TEAM,
    PERMISSIONS.PAGES_PUBLISH,
    PERMISSIONS.RESOURCES_VIEW_OWN,
    PERMISSIONS.RESOURCES_VIEW_TEAM,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_EDIT_OWN,
    PERMISSIONS.RESOURCES_DELETE_OWN,
    PERMISSIONS.RESOURCES_DELETE_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_OWN,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_TEAM,
    PERMISSIONS.EMAIL_CAPTURES_EXPORT,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.TEAMS_INVITE,
    PERMISSIONS.WEBHOOKS_VIEW,
    PERMISSIONS.WEBHOOKS_CREATE,
    PERMISSIONS.WEBHOOKS_MANAGE,
    PERMISSIONS.WEBHOOKS_DELETE,
    PERMISSIONS.DOMAINS_VIEW,
    PERMISSIONS.DOMAINS_CREATE,
    PERMISSIONS.DOMAINS_MANAGE,
    PERMISSIONS.DOMAINS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_BILLING,
  ],

  admin: [
    // All permissions except super_admin specific
    PERMISSIONS.PAGES_VIEW_OWN,
    PERMISSIONS.PAGES_VIEW_TEAM,
    PERMISSIONS.PAGES_VIEW_ALL,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT_OWN,
    PERMISSIONS.PAGES_EDIT_TEAM,
    PERMISSIONS.PAGES_EDIT_ALL,
    PERMISSIONS.PAGES_DELETE_OWN,
    PERMISSIONS.PAGES_DELETE_TEAM,
    PERMISSIONS.PAGES_DELETE_ALL,
    PERMISSIONS.PAGES_PUBLISH,
    PERMISSIONS.RESOURCES_VIEW_OWN,
    PERMISSIONS.RESOURCES_VIEW_TEAM,
    PERMISSIONS.RESOURCES_CREATE,
    PERMISSIONS.RESOURCES_EDIT_OWN,
    PERMISSIONS.RESOURCES_DELETE_OWN,
    PERMISSIONS.RESOURCES_DELETE_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_TEAM,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_OWN,
    PERMISSIONS.EMAIL_CAPTURES_VIEW_TEAM,
    PERMISSIONS.EMAIL_CAPTURES_EXPORT,
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.TEAMS_DELETE,
    PERMISSIONS.TEAMS_INVITE,
    PERMISSIONS.WEBHOOKS_VIEW,
    PERMISSIONS.WEBHOOKS_CREATE,
    PERMISSIONS.WEBHOOKS_MANAGE,
    PERMISSIONS.WEBHOOKS_DELETE,
    PERMISSIONS.DOMAINS_VIEW,
    PERMISSIONS.DOMAINS_CREATE,
    PERMISSIONS.DOMAINS_MANAGE,
    PERMISSIONS.DOMAINS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_BILLING,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.ADMIN_USERS_VIEW,
    PERMISSIONS.ADMIN_USERS_EDIT,
    PERMISSIONS.ADMIN_CONTENT_MODERATE,
  ],

  super_admin: [
    // Wildcard - all permissions (checked separately in hasPermission)
  ],
};

// ============================================================================
// Resource Ownership Types (Layer 3)
// ============================================================================

export interface ResourceOwnership {
  userId: string;
  teamId?: string;
  tenantId?: string;
}

export interface OwnershipCheck {
  resourceType: string;
  resourceId: string;
  requiredOwnership: 'own' | 'team' | 'any';
}

/**
 * Resources and their ownership column mappings
 */
export const RESOURCE_OWNERSHIP_COLUMNS: Record<string, { userColumn: string; teamColumn?: string }> = {
  pages: { userColumn: 'user_id', teamColumn: 'team_id' },
  resources: { userColumn: 'user_id' },
  email_captures: { userColumn: 'user_id' }, // Indirect via page ownership
  webhooks: { userColumn: 'user_id' },
  custom_domains: { userColumn: 'user_id' },
  teams: { userColumn: 'owner_id' },
  team_members: { userColumn: 'user_id', teamColumn: 'team_id' },
};

// ============================================================================
// Security Context Types
// ============================================================================

export interface SecurityContext {
  // Layer 1: Authentication
  isAuthenticated: boolean;
  user: User | null;
  userId: string | null;

  // Layer 2: Authorization
  role: UserRole;
  roleLevel: number;
  permissions: PermissionValue[];

  // Layer 3: Ownership context
  teamIds: string[];
  tenantId: string | null;

  // Subscription context (affects some permissions)
  subscriptionPlan: 'free' | 'pro' | 'business';
}

// ============================================================================
// Security Check Results
// ============================================================================

export interface SecurityCheckResult {
  allowed: boolean;
  deniedReason?: SecurityDeniedReason;
  layer?: 'authentication' | 'authorization' | 'ownership' | 'rls';
  details?: string;
}

export type SecurityDeniedReason =
  | 'not_authenticated'
  | 'email_not_verified'
  | 'onboarding_incomplete'
  | 'insufficient_permissions'
  | 'insufficient_role_level'
  | 'not_resource_owner'
  | 'not_team_member'
  | 'subscription_limit_reached'
  | 'rls_denied';

// ============================================================================
// Security Audit Types
// ============================================================================

export interface SecurityAuditEvent {
  timestamp: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  layer: 'authentication' | 'authorization' | 'ownership' | 'rls';
  result: 'allowed' | 'denied';
  deniedReason?: SecurityDeniedReason;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Middleware Configuration Types
// ============================================================================

export interface SecurityMiddlewareConfig {
  // Layer 1
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  requireOnboardingComplete?: boolean;

  // Layer 2
  requiredPermissions?: PermissionValue[];
  requiredAnyPermission?: PermissionValue[];
  minimumRoleLevel?: number;
  allowedRoles?: UserRole[];

  // Layer 3
  resourceOwnership?: {
    resourceType: string;
    resourceIdParam?: string; // Route parameter name
    allowTeamAccess?: boolean;
  };

  // Subscription checks
  requiredSubscription?: ('free' | 'pro' | 'business')[];
  requireFeature?: string;

  // Redirect behavior
  redirectOnFail?: string;
  showToastOnFail?: boolean;
}

export const DEFAULT_SECURITY_CONFIG: SecurityMiddlewareConfig = {
  requireAuth: true,
  requireEmailVerified: false,
  requireOnboardingComplete: false,
  showToastOnFail: true,
};
