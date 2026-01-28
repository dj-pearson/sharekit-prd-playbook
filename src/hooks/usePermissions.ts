/**
 * usePermissions Hook - Layer 2: Authorization
 *
 * Provides permission and role-based access control for React components.
 * Use this hook to check what actions a user can perform.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuth';
import type { UserRole, PermissionValue, SecurityCheckResult } from '@/lib/security/types';
import {
  getUserRole,
  getRoleLevel,
  getPermissionsForRole,
  roleHasPermission,
  checkAuthorization,
  getAuthorizationErrorMessage,
  PERMISSIONS,
} from '@/lib/security/authorization';

// Re-export PERMISSIONS for convenience
export { PERMISSIONS };

interface UsePermissionsOptions {
  /** Required permissions (all must be present) */
  requiredPermissions?: PermissionValue[];
  /** Required any permission (at least one must be present) */
  requiredAnyPermission?: PermissionValue[];
  /** Minimum role level required */
  minimumRoleLevel?: number;
  /** Allowed roles */
  allowedRoles?: UserRole[];
  /** Redirect path if authorization fails */
  redirectTo?: string;
  /** Show toast on authorization failure (default: true) */
  showToast?: boolean;
}

interface UsePermissionsReturn {
  /** User's current role */
  role: UserRole;
  /** User's role level (numeric) */
  roleLevel: number;
  /** All permissions the user has */
  permissions: PermissionValue[];
  /** Whether permissions are loading */
  isLoading: boolean;
  /** Whether the user meets all requirements */
  isAuthorized: boolean;
  /** Check if user has a specific permission */
  can: (permission: PermissionValue) => boolean;
  /** Check if user has any of the specified permissions */
  canAny: (permissions: PermissionValue[]) => boolean;
  /** Check if user has all of the specified permissions */
  canAll: (permissions: PermissionValue[]) => boolean;
  /** Check if user has minimum role level */
  hasMinRoleLevel: (level: number) => boolean;
  /** Check if user has one of the specified roles */
  hasRole: (roles: UserRole[]) => boolean;
  /** Perform an authorization check with custom options */
  checkAuthorization: (options: UsePermissionsOptions) => Promise<SecurityCheckResult>;
}

export function usePermissions(options: UsePermissionsOptions = {}): UsePermissionsReturn {
  const {
    requiredPermissions,
    requiredAnyPermission,
    minimumRoleLevel,
    allowedRoles,
    redirectTo = '/dashboard',
    showToast = true,
  } = options;

  const { userId, isAuthenticated, isLoading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Derive role level and permissions
  const roleLevel = useMemo(() => getRoleLevel(role), [role]);
  const permissions = useMemo(() => getPermissionsForRole(role), [role]);

  // Load user role
  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      if (authLoading) return;

      if (!isAuthenticated || !userId) {
        if (mounted) {
          setRole('guest');
          setIsLoading(false);
        }
        return;
      }

      try {
        const userRole = await getUserRole(userId);
        if (mounted) {
          setRole(userRole);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
        if (mounted) {
          setRole('user'); // Default to basic user on error
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadRole();

    return () => {
      mounted = false;
    };
  }, [userId, isAuthenticated, authLoading]);

  // Check authorization requirements
  useEffect(() => {
    if (isLoading || authLoading) return;

    const hasRequirements =
      requiredPermissions?.length ||
      requiredAnyPermission?.length ||
      minimumRoleLevel !== undefined ||
      allowedRoles?.length;

    if (!hasRequirements) {
      setIsAuthorized(true);
      return;
    }

    const checkRequirements = async () => {
      const result = await checkAuthorization({
        requiredPermissions,
        requiredAnyPermission,
        minimumRoleLevel,
        allowedRoles,
      });

      if (!result.allowed) {
        setIsAuthorized(false);

        if (showToast) {
          toast({
            title: 'Access Denied',
            description: getAuthorizationErrorMessage(result.details),
            variant: 'destructive',
          });
        }

        if (redirectTo) {
          navigate(redirectTo);
        }
      } else {
        setIsAuthorized(true);
      }
    };

    checkRequirements();
  }, [
    isLoading,
    authLoading,
    role,
    requiredPermissions,
    requiredAnyPermission,
    minimumRoleLevel,
    allowedRoles,
    redirectTo,
    showToast,
    navigate,
    toast,
  ]);

  // Permission check functions
  const can = useCallback(
    (permission: PermissionValue): boolean => {
      return roleHasPermission(role, permission);
    },
    [role]
  );

  const canAny = useCallback(
    (perms: PermissionValue[]): boolean => {
      if (role === 'super_admin') return true;
      return perms.some((p) => roleHasPermission(role, p));
    },
    [role]
  );

  const canAll = useCallback(
    (perms: PermissionValue[]): boolean => {
      if (role === 'super_admin') return true;
      return perms.every((p) => roleHasPermission(role, p));
    },
    [role]
  );

  const hasMinRoleLevel = useCallback(
    (level: number): boolean => {
      return roleLevel >= level;
    },
    [roleLevel]
  );

  const hasRoleFn = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.includes(role);
    },
    [role]
  );

  const checkAuthorizationFn = useCallback(
    async (opts: UsePermissionsOptions): Promise<SecurityCheckResult> => {
      return checkAuthorization({
        requiredPermissions: opts.requiredPermissions,
        requiredAnyPermission: opts.requiredAnyPermission,
        minimumRoleLevel: opts.minimumRoleLevel,
        allowedRoles: opts.allowedRoles,
      });
    },
    []
  );

  return {
    role,
    roleLevel,
    permissions,
    isLoading: isLoading || authLoading,
    isAuthorized,
    can,
    canAny,
    canAll,
    hasMinRoleLevel,
    hasRole: hasRoleFn,
    checkAuthorization: checkAuthorizationFn,
  };
}

/**
 * Simple hook to check a single permission
 */
export function useCanDo(permission: PermissionValue): {
  can: boolean;
  isLoading: boolean;
} {
  const { can, isLoading } = usePermissions();
  return {
    can: can(permission),
    isLoading,
  };
}

/**
 * Hook to require specific permissions - redirects if not met
 */
export function useRequirePermissions(
  permissions: PermissionValue[],
  redirectTo: string = '/dashboard'
): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const { isAuthorized, isLoading } = usePermissions({
    requiredPermissions: permissions,
    redirectTo,
    showToast: true,
  });

  return {
    isAuthorized,
    isLoading,
  };
}
