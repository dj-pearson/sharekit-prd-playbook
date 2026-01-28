/**
 * ProtectedRoute Component
 *
 * A wrapper component that enforces security checks on routes.
 * Implements all 4 security layers (authentication, authorization, ownership).
 *
 * Usage:
 * <ProtectedRoute config={SECURITY_CONFIGS.dashboard}>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * Or with custom config:
 * <ProtectedRoute
 *   requireAuth
 *   requiredPermissions={['pages.edit_own']}
 *   resourceType="pages"
 *   resourceId={pageId}
 * >
 *   <PageEditor />
 * </ProtectedRoute>
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type {
  SecurityMiddlewareConfig,
  SecurityCheckResult,
  UserRole,
  PermissionValue,
} from '@/lib/security/types';
import {
  runSecurityChecks,
  runOwnershipCheck,
  getSecurityErrorMessage,
  getSecurityRedirectPath,
  SECURITY_CONFIGS,
} from '@/lib/security/middleware';

interface ProtectedRouteProps {
  children: React.ReactNode;

  /** Predefined security configuration */
  config?: SecurityMiddlewareConfig;

  /** Layer 1: Authentication */
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  requireOnboardingComplete?: boolean;

  /** Layer 2: Authorization */
  requiredPermissions?: PermissionValue[];
  requiredAnyPermission?: PermissionValue[];
  minimumRoleLevel?: number;
  allowedRoles?: UserRole[];

  /** Layer 3: Resource Ownership */
  resourceType?: string;
  resourceId?: string;
  resourceIdParam?: string; // Route param name to get resourceId from
  allowTeamAccess?: boolean;

  /** Subscription */
  requiredSubscription?: ('free' | 'pro' | 'business')[];

  /** Behavior */
  redirectTo?: string;
  showToast?: boolean;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  config,
  requireAuth = true,
  requireEmailVerified,
  requireOnboardingComplete,
  requiredPermissions,
  requiredAnyPermission,
  minimumRoleLevel,
  allowedRoles,
  resourceType,
  resourceId: propResourceId,
  resourceIdParam,
  allowTeamAccess,
  requiredSubscription,
  redirectTo,
  showToast = true,
  fallback,
  loadingComponent,
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { toast } = useToast();

  // Get resourceId from props or route params
  const resourceId = propResourceId || (resourceIdParam ? params[resourceIdParam] : undefined);

  // Build security config from props or use provided config
  const securityConfig: SecurityMiddlewareConfig = config || {
    requireAuth,
    requireEmailVerified,
    requireOnboardingComplete,
    requiredPermissions,
    requiredAnyPermission,
    minimumRoleLevel,
    allowedRoles,
    requiredSubscription,
    resourceOwnership: resourceType
      ? {
          resourceType,
          allowTeamAccess,
        }
      : undefined,
    redirectOnFail: redirectTo,
    showToastOnFail: showToast,
  };

  const handleSecurityFailure = useCallback(
    (result: SecurityCheckResult) => {
      if (showToast && result.deniedReason) {
        toast({
          title: 'Access Denied',
          description: getSecurityErrorMessage(result),
          variant: 'destructive',
        });
      }

      const redirect = redirectTo || getSecurityRedirectPath(result, '/dashboard');

      // Store return path for post-auth redirect
      const returnTo = location.pathname + location.search;
      if (returnTo !== '/auth' && returnTo !== '/') {
        sessionStorage.setItem('auth_return_to', returnTo);
      }

      navigate(redirect);
    },
    [navigate, location, toast, showToast, redirectTo]
  );

  useEffect(() => {
    let mounted = true;

    const performSecurityChecks = async () => {
      setIsLoading(true);

      try {
        // Run authentication and authorization checks
        const result = await runSecurityChecks(securityConfig);

        if (!mounted) return;

        if (!result.allowed) {
          setIsAuthorized(false);
          handleSecurityFailure(result);
          return;
        }

        // Run ownership check if resourceType and resourceId are provided
        if (resourceType && resourceId) {
          const ownershipResult = await runOwnershipCheck(resourceType, resourceId, {
            allowTeamAccess,
          });

          if (!mounted) return;

          if (!ownershipResult.allowed) {
            setIsAuthorized(false);
            handleSecurityFailure(ownershipResult);
            return;
          }
        }

        if (mounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Security check error:', error);
        if (mounted) {
          setIsAuthorized(false);
          handleSecurityFailure({
            allowed: false,
            deniedReason: 'not_authenticated',
            layer: 'authentication',
            details: 'An error occurred during security verification.',
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    performSecurityChecks();

    return () => {
      mounted = false;
    };
  }, [
    securityConfig,
    resourceType,
    resourceId,
    allowTeamAccess,
    handleSecurityFailure,
  ]);

  // Show loading state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show fallback or nothing if not authorized
  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : null;
  }

  // Render children if authorized
  return <>{children}</>;
}

/**
 * Higher-order component version for class components or specific use cases
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  config: SecurityMiddlewareConfig | ProtectedRouteProps
) {
  return function ProtectedComponent(props: P) {
    const routeProps = 'requireAuth' in config ? config : { config };
    return (
      <ProtectedRoute {...routeProps}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Quick access protected route components for common configurations
 */
export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'config'>) {
  return (
    <ProtectedRoute config={SECURITY_CONFIGS.authenticated} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function DashboardRoute({ children, ...props }: Omit<ProtectedRouteProps, 'config'>) {
  return (
    <ProtectedRoute config={SECURITY_CONFIGS.dashboard} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'config'>) {
  return (
    <ProtectedRoute config={SECURITY_CONFIGS.admin} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
