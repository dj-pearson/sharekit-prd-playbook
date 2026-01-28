/**
 * Security Library - Defense-in-Depth Implementation
 *
 * This library implements a 4-layer security model:
 *
 * Layer 1: Authentication (WHO are you?)
 *   - Session validation
 *   - JWT token verification
 *   - Email verification
 *   - Onboarding completion
 *
 * Layer 2: Authorization (WHAT can you do?)
 *   - Role-based access control (RBAC)
 *   - Permission checks
 *   - Role level hierarchy
 *
 * Layer 3: Resource Ownership (IS this yours?)
 *   - Direct ownership verification
 *   - Team-based access
 *   - Tenant isolation
 *
 * Layer 4: Database RLS (FINAL enforcement)
 *   - Row-level security policies
 *   - Database-level access control
 *   - Audit logging
 */

// Types
export * from './types';

// Layer 1: Authentication
export {
  getAuthState,
  getCurrentUser,
  isSessionValid,
  requireAuth,
  requireEmailVerified,
  requireOnboardingComplete,
  checkAuthentication,
  onAuthStateChange,
  getAuthErrorMessage,
  getAuthRedirectPath,
  type AuthCheckOptions,
} from './authentication';

// Layer 2: Authorization
export {
  getUserRole,
  getRoleLevel,
  getPermissionsForRole,
  roleHasPermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  meetsRoleLevel,
  hasRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRoleLevel,
  requireRole,
  checkAuthorization,
  getAuthorizationErrorMessage,
  PERMISSIONS,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  type AuthorizationCheckOptions,
} from './authorization';

// Layer 3: Resource Ownership
export {
  RESOURCE_CONFIGS,
  getUserTeamIds,
  isTeamMember,
  hasTeamRole,
  isResourceOwner,
  isTeamResourceOwner,
  requireOwnership,
  requireOwnershipOrTeam,
  requireTeamMembership,
  requireTeamRole,
  checkOwnership,
  addOwnershipFilter,
  getOwnershipContext,
  getOwnershipErrorMessage,
  type ResourceConfig,
  type OwnershipCheckOptions,
} from './ownership';

// Security Middleware
export {
  runSecurityChecks,
  runOwnershipCheck,
  runFullSecurityCheck,
  SECURITY_CONFIGS,
  createSecurityConfig,
  getSecurityErrorMessage,
  getSecurityRedirectPath,
} from './middleware';

// Audit Logging
export {
  logSecurityEvent,
  logAuthenticationEvent,
  logAuthorizationEvent,
  logOwnershipEvent,
} from './audit';
