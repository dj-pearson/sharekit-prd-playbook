/**
 * useResourceOwnership Hook - Layer 3: Resource Ownership
 *
 * Provides resource ownership verification for React components.
 * Use this hook to verify that users have access to specific resources.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuth';
import type { SecurityCheckResult } from '@/lib/security/types';
import {
  getUserTeamIds,
  isResourceOwner,
  isTeamResourceOwner,
  checkOwnership,
  getOwnershipErrorMessage,
  type OwnershipCheckOptions,
} from '@/lib/security/ownership';

interface UseResourceOwnershipOptions {
  /** Resource type (e.g., 'pages', 'resources') */
  resourceType: string;
  /** Resource ID to check ownership for */
  resourceId?: string;
  /** Allow access if user is in the resource's team */
  allowTeamAccess?: boolean;
  /** Required team roles if using team access */
  requiredTeamRoles?: ('owner' | 'admin' | 'member')[];
  /** Redirect path if ownership check fails */
  redirectTo?: string;
  /** Show toast on ownership failure (default: true) */
  showToast?: boolean;
  /** Skip the check (useful for conditional checking) */
  skip?: boolean;
}

interface UseResourceOwnershipReturn {
  /** Whether the user owns the resource (or has team access) */
  isOwner: boolean;
  /** Whether the ownership check is loading */
  isLoading: boolean;
  /** Team IDs the user belongs to */
  teamIds: string[];
  /** Check ownership of a specific resource */
  checkOwnership: (resourceId: string) => Promise<SecurityCheckResult>;
  /** Check if user owns any of the given resource IDs */
  checkOwnershipMultiple: (resourceIds: string[]) => Promise<Map<string, boolean>>;
}

export function useResourceOwnership(
  options: UseResourceOwnershipOptions
): UseResourceOwnershipReturn {
  const {
    resourceType,
    resourceId,
    allowTeamAccess = false,
    requiredTeamRoles,
    redirectTo,
    showToast = true,
    skip = false,
  } = options;

  const { userId, isAuthenticated, isLoading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamIds, setTeamIds] = useState<string[]>([]);

  // Load team memberships
  useEffect(() => {
    let mounted = true;

    const loadTeams = async () => {
      if (!userId) {
        if (mounted) setTeamIds([]);
        return;
      }

      try {
        const teams = await getUserTeamIds(userId);
        if (mounted) {
          setTeamIds(teams);
        }
      } catch (error) {
        console.error('Error loading team memberships:', error);
      }
    };

    if (isAuthenticated && userId) {
      loadTeams();
    }

    return () => {
      mounted = false;
    };
  }, [userId, isAuthenticated]);

  // Check ownership when resourceId is provided
  useEffect(() => {
    let mounted = true;

    const verifyOwnership = async () => {
      if (skip || !resourceId || !userId || authLoading) {
        if (mounted) {
          setIsLoading(false);
          if (skip) setIsOwner(true);
        }
        return;
      }

      setIsLoading(true);

      try {
        const result = await checkOwnership({
          resourceType,
          resourceId,
          allowTeamAccess,
          requiredTeamRoles,
        });

        if (!mounted) return;

        setIsOwner(result.allowed);

        if (!result.allowed) {
          if (showToast) {
            toast({
              title: 'Access Denied',
              description: getOwnershipErrorMessage(result.deniedReason),
              variant: 'destructive',
            });
          }

          if (redirectTo) {
            navigate(redirectTo);
          }
        }
      } catch (error) {
        console.error('Error verifying ownership:', error);
        if (mounted) {
          setIsOwner(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    verifyOwnership();

    return () => {
      mounted = false;
    };
  }, [
    resourceType,
    resourceId,
    userId,
    authLoading,
    allowTeamAccess,
    requiredTeamRoles,
    redirectTo,
    showToast,
    skip,
    navigate,
    toast,
  ]);

  // Manual ownership check function
  const checkOwnershipFn = useCallback(
    async (id: string): Promise<SecurityCheckResult> => {
      if (!userId) {
        return {
          allowed: false,
          deniedReason: 'not_authenticated',
          layer: 'authentication',
        };
      }

      return checkOwnership({
        resourceType,
        resourceId: id,
        allowTeamAccess,
        requiredTeamRoles,
      });
    },
    [resourceType, userId, allowTeamAccess, requiredTeamRoles]
  );

  // Check multiple resources at once
  const checkOwnershipMultiple = useCallback(
    async (resourceIds: string[]): Promise<Map<string, boolean>> => {
      const results = new Map<string, boolean>();

      if (!userId) {
        resourceIds.forEach((id) => results.set(id, false));
        return results;
      }

      // Check in parallel
      const checks = await Promise.all(
        resourceIds.map(async (id) => {
          const result = await checkOwnership({
            resourceType,
            resourceId: id,
            allowTeamAccess,
            requiredTeamRoles,
          });
          return { id, allowed: result.allowed };
        })
      );

      checks.forEach(({ id, allowed }) => results.set(id, allowed));
      return results;
    },
    [resourceType, userId, allowTeamAccess, requiredTeamRoles]
  );

  return {
    isOwner,
    isLoading: isLoading || authLoading,
    teamIds,
    checkOwnership: checkOwnershipFn,
    checkOwnershipMultiple,
  };
}

/**
 * Simple hook to verify ownership of a single resource
 * Redirects to dashboard if not owner
 */
export function useRequireOwnership(
  resourceType: string,
  resourceId: string,
  options: {
    allowTeamAccess?: boolean;
    redirectTo?: string;
  } = {}
): {
  isOwner: boolean;
  isLoading: boolean;
} {
  const { isOwner, isLoading } = useResourceOwnership({
    resourceType,
    resourceId,
    allowTeamAccess: options.allowTeamAccess ?? false,
    redirectTo: options.redirectTo ?? '/dashboard',
    showToast: true,
  });

  return { isOwner, isLoading };
}
