/**
 * useSecurity Hook - Combined Security Hook
 *
 * Provides access to all 4 security layers in a single hook.
 * This is the primary hook for security checks in React components.
 *
 * Usage:
 * const security = useSecurity();
 *
 * // Check authentication
 * if (!security.isAuthenticated) return <LoginPrompt />;
 *
 * // Check permissions
 * if (security.can('pages.create')) { ... }
 *
 * // Check ownership
 * const canEdit = await security.checkOwnership('pages', pageId);
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import type {
  UserRole,
  PermissionValue,
  SecurityCheckResult,
  SecurityContext,
  SecurityMiddlewareConfig,
} from '@/lib/security/types';
import { getAuthState, getCurrentUser } from '@/lib/security/authentication';
import {
  getUserRole,
  getRoleLevel,
  getPermissionsForRole,
  roleHasPermission,
  checkAuthorization,
} from '@/lib/security/authorization';
import {
  getUserTeamIds,
  isResourceOwner,
  isTeamResourceOwner,
  checkOwnership,
} from '@/lib/security/ownership';
import {
  runSecurityChecks,
  runFullSecurityCheck,
  getSecurityErrorMessage,
  getSecurityRedirectPath,
} from '@/lib/security/middleware';

interface UseSecurityReturn {
  // Layer 1: Authentication
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;

  // Layer 2: Authorization
  role: UserRole;
  roleLevel: number;
  permissions: PermissionValue[];

  // Layer 3: Ownership Context
  teamIds: string[];

  // Loading state
  isLoading: boolean;

  // Full security context
  context: SecurityContext | null;

  // Permission checks
  can: (permission: PermissionValue) => boolean;
  canAny: (permissions: PermissionValue[]) => boolean;
  canAll: (permissions: PermissionValue[]) => boolean;
  hasMinRoleLevel: (level: number) => boolean;
  hasRole: (roles: UserRole[]) => boolean;

  // Ownership checks
  checkOwnership: (
    resourceType: string,
    resourceId: string,
    options?: { allowTeamAccess?: boolean }
  ) => Promise<SecurityCheckResult>;
  isOwner: (resourceType: string, resourceId: string) => Promise<boolean>;
  isTeamOwner: (resourceType: string, resourceId: string) => Promise<boolean>;

  // Full security checks
  runSecurityCheck: (config: SecurityMiddlewareConfig) => Promise<SecurityCheckResult>;
  runFullCheck: (
    config: SecurityMiddlewareConfig,
    resourceId?: string
  ) => Promise<SecurityCheckResult>;

  // Utilities
  getErrorMessage: (result: SecurityCheckResult) => string;
  getRedirectPath: (result: SecurityCheckResult) => string;
}

export function useSecurity(): UseSecurityReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Derived state
  const userId = user?.id || null;
  const isAuthenticated = !!user;
  const roleLevel = useMemo(() => getRoleLevel(role), [role]);
  const permissions = useMemo(() => getPermissionsForRole(role), [role]);

  // Full security context
  const context = useMemo<SecurityContext | null>(() => {
    if (!user) return null;

    return {
      isAuthenticated: true,
      user,
      userId: user.id,
      role,
      roleLevel,
      permissions,
      teamIds,
      tenantId: null, // Add tenant support if needed
      subscriptionPlan: 'free', // TODO: Get from subscription hook
    };
  }, [user, role, roleLevel, permissions, teamIds]);

  // Load security context
  useEffect(() => {
    let mounted = true;

    const loadSecurityContext = async () => {
      setIsLoading(true);

      try {
        // Get auth state
        const authState = await getAuthState();

        if (!mounted) return;

        if (!authState.isAuthenticated || !authState.user) {
          setUser(null);
          setRole('guest');
          setTeamIds([]);
          setIsLoading(false);
          return;
        }

        setUser(authState.user);

        // Load role and teams in parallel
        const [userRole, userTeamIds] = await Promise.all([
          getUserRole(authState.user.id),
          getUserTeamIds(authState.user.id),
        ]);

        if (mounted) {
          setRole(userRole);
          setTeamIds(userTeamIds);
        }
      } catch (error) {
        console.error('Error loading security context:', error);
        if (mounted) {
          setUser(null);
          setRole('guest');
          setTeamIds([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSecurityContext();

    return () => {
      mounted = false;
    };
  }, []);

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

  // Ownership check functions
  const checkOwnershipFn = useCallback(
    async (
      resourceType: string,
      resourceId: string,
      options: { allowTeamAccess?: boolean } = {}
    ): Promise<SecurityCheckResult> => {
      if (!userId) {
        return {
          allowed: false,
          deniedReason: 'not_authenticated',
          layer: 'authentication',
        };
      }

      return checkOwnership({
        resourceType,
        resourceId,
        allowTeamAccess: options.allowTeamAccess,
      });
    },
    [userId]
  );

  const isOwnerFn = useCallback(
    async (resourceType: string, resourceId: string): Promise<boolean> => {
      if (!userId) return false;
      return isResourceOwner(resourceType, resourceId, userId);
    },
    [userId]
  );

  const isTeamOwnerFn = useCallback(
    async (resourceType: string, resourceId: string): Promise<boolean> => {
      if (!userId) return false;
      return isTeamResourceOwner(resourceType, resourceId, userId);
    },
    [userId]
  );

  // Full security check functions
  const runSecurityCheckFn = useCallback(
    async (config: SecurityMiddlewareConfig): Promise<SecurityCheckResult> => {
      return runSecurityChecks(config);
    },
    []
  );

  const runFullCheckFn = useCallback(
    async (
      config: SecurityMiddlewareConfig,
      resourceId?: string
    ): Promise<SecurityCheckResult> => {
      return runFullSecurityCheck(config, resourceId);
    },
    []
  );

  return {
    // Layer 1
    user,
    userId,
    isAuthenticated,

    // Layer 2
    role,
    roleLevel,
    permissions,

    // Layer 3
    teamIds,

    // State
    isLoading,
    context,

    // Permission checks
    can,
    canAny,
    canAll,
    hasMinRoleLevel,
    hasRole: hasRoleFn,

    // Ownership checks
    checkOwnership: checkOwnershipFn,
    isOwner: isOwnerFn,
    isTeamOwner: isTeamOwnerFn,

    // Full checks
    runSecurityCheck: runSecurityCheckFn,
    runFullCheck: runFullCheckFn,

    // Utilities
    getErrorMessage: getSecurityErrorMessage,
    getRedirectPath: getSecurityRedirectPath,
  };
}

/**
 * Hook to enforce security requirements
 * Redirects if requirements are not met
 */
export function useRequireSecurity(
  config: SecurityMiddlewareConfig,
  options: {
    resourceId?: string;
    redirectTo?: string;
    showToast?: boolean;
  } = {}
): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  const { resourceId, redirectTo, showToast = true } = options;

  useEffect(() => {
    let mounted = true;

    const checkSecurity = async () => {
      try {
        const result = await runFullSecurityCheck(config, resourceId);

        if (!mounted) return;

        if (!result.allowed) {
          setIsAuthorized(false);

          if (showToast) {
            toast({
              title: 'Access Denied',
              description: getSecurityErrorMessage(result),
              variant: 'destructive',
            });
          }

          navigate(redirectTo || getSecurityRedirectPath(result, '/dashboard'));
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Security check error:', error);
        if (mounted) {
          setIsAuthorized(false);
          navigate('/auth');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSecurity();

    return () => {
      mounted = false;
    };
  }, [config, resourceId, redirectTo, showToast, navigate, toast]);

  return {
    isAuthorized,
    isLoading,
  };
}

export default useSecurity;
