/**
 * useAuth Hook - Layer 1: Authentication
 *
 * Provides authentication state and utilities for React components.
 * This hook handles user identity verification and session management.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AuthState, SecurityCheckResult } from '@/lib/security/types';
import {
  getAuthState,
  getCurrentUser,
  checkAuthentication,
  onAuthStateChange,
  getAuthErrorMessage,
  getAuthRedirectPath,
} from '@/lib/security/authentication';

interface UseAuthOptions {
  /** Require user to be authenticated (default: true) */
  requireAuth?: boolean;
  /** Require email to be verified */
  requireEmailVerified?: boolean;
  /** Require onboarding to be completed */
  requireOnboardingComplete?: boolean;
  /** Custom redirect path on authentication failure */
  redirectTo?: string;
  /** Show toast on authentication failure (default: true) */
  showToast?: boolean;
}

interface UseAuthReturn {
  /** Current authenticated user or null */
  user: User | null;
  /** User ID convenience accessor */
  userId: string | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication state is loading */
  isLoading: boolean;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Refresh the authentication state */
  refresh: () => Promise<void>;
  /** Check a specific authentication requirement */
  checkAuth: (options?: UseAuthOptions) => Promise<SecurityCheckResult>;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    requireAuth = true,
    requireEmailVerified = false,
    requireOnboardingComplete = false,
    redirectTo,
    showToast = true,
  } = options;

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle authentication failure
  const handleAuthFailure = useCallback(
    (result: SecurityCheckResult) => {
      if (showToast && result.deniedReason) {
        toast({
          title: 'Access Denied',
          description: getAuthErrorMessage(result.deniedReason),
          variant: 'destructive',
        });
      }

      const redirect = redirectTo || getAuthRedirectPath(result.deniedReason!);

      // Store the intended destination for post-login redirect
      const returnTo = location.pathname + location.search;
      if (returnTo !== '/auth' && returnTo !== '/') {
        sessionStorage.setItem('auth_return_to', returnTo);
      }

      navigate(redirect);
    },
    [navigate, location, toast, showToast, redirectTo]
  );

  // Initial auth check and subscription
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const state = await getAuthState();

        if (!mounted) return;

        setAuthState(state);

        // Perform requirement checks
        if (requireAuth || requireEmailVerified || requireOnboardingComplete) {
          const result = await checkAuthentication({
            requireAuth,
            requireEmailVerified,
            requireOnboardingComplete,
          });

          if (!result.allowed && mounted) {
            handleAuthFailure(result);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (state) => {
      if (!mounted) return;

      setAuthState(state);

      // Re-check requirements on state change
      if (
        !state.isAuthenticated &&
        (requireAuth || requireEmailVerified || requireOnboardingComplete)
      ) {
        const result = await checkAuthentication({
          requireAuth,
          requireEmailVerified,
          requireOnboardingComplete,
        });

        if (!result.allowed && mounted) {
          handleAuthFailure(result);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [requireAuth, requireEmailVerified, requireOnboardingComplete, handleAuthFailure]);

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast({
        title: 'Signed out',
        description: "You've been successfully signed out.",
      });
      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign out.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [navigate, toast]);

  // Refresh auth state
  const refresh = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    const state = await getAuthState();
    setAuthState(state);
  }, []);

  // Manual auth check function
  const checkAuth = useCallback(async (checkOptions?: UseAuthOptions): Promise<SecurityCheckResult> => {
    const opts = checkOptions || {
      requireAuth,
      requireEmailVerified,
      requireOnboardingComplete,
    };
    return checkAuthentication(opts);
  }, [requireAuth, requireEmailVerified, requireOnboardingComplete]);

  return {
    user: authState.user,
    userId: authState.user?.id || null,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    signOut,
    refresh,
    checkAuth,
  };
}

/**
 * Lightweight hook for components that only need to check if user is logged in
 * Does not perform redirects or show toasts
 */
export function useAuthState(): Pick<UseAuthReturn, 'user' | 'userId' | 'isAuthenticated' | 'isLoading'> {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const state = await getAuthState();
      if (mounted) {
        setAuthState(state);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChange((state) => {
      if (mounted) {
        setAuthState(state);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return {
    user: authState.user,
    userId: authState.user?.id || null,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
  };
}
