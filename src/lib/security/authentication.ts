/**
 * Layer 1: Authentication
 *
 * Handles user identity verification:
 * - Session validation
 * - JWT token checks
 * - Email verification status
 * - Onboarding completion status
 */

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthState, SecurityCheckResult, SecurityDeniedReason } from './types';

// ============================================================================
// Core Authentication Functions
// ============================================================================

/**
 * Get the current authentication state
 */
export async function getAuthState(): Promise<AuthState> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    return {
      user: session.user,
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at || 0,
      },
      isAuthenticated: true,
      isLoading: false,
    };
  } catch (error) {
    console.error('Error getting auth state:', error);
    return {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
}

/**
 * Get the current user (with fresh data)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if a session is valid and not expired
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;

  // Check if token is expired
  const expiresAt = session.expires_at;
  if (expiresAt && expiresAt * 1000 < Date.now()) {
    return false;
  }

  return true;
}

// ============================================================================
// Authentication Requirement Checks
// ============================================================================

/**
 * Check if user is authenticated (Layer 1 - Primary)
 */
export async function requireAuth(): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  return {
    allowed: true,
    layer: 'authentication',
  };
}

/**
 * Check if user's email is verified
 */
export async function requireEmailVerified(): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  if (!user.email_confirmed_at) {
    return {
      allowed: false,
      deniedReason: 'email_not_verified',
      layer: 'authentication',
      details: 'Email address has not been verified',
    };
  }

  return {
    allowed: true,
    layer: 'authentication',
  };
}

/**
 * Check if user has completed onboarding
 */
export async function requireOnboardingComplete(): Promise<SecurityCheckResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      allowed: false,
      deniedReason: 'not_authenticated',
      layer: 'authentication',
      details: 'User is not authenticated',
    };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (error || !profile?.onboarding_completed) {
      return {
        allowed: false,
        deniedReason: 'onboarding_incomplete',
        layer: 'authentication',
        details: 'User has not completed onboarding',
      };
    }

    return {
      allowed: true,
      layer: 'authentication',
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      allowed: false,
      deniedReason: 'onboarding_incomplete',
      layer: 'authentication',
      details: 'Unable to verify onboarding status',
    };
  }
}

// ============================================================================
// Combined Authentication Check
// ============================================================================

export interface AuthCheckOptions {
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  requireOnboardingComplete?: boolean;
}

/**
 * Perform all authentication checks based on options
 */
export async function checkAuthentication(
  options: AuthCheckOptions = { requireAuth: true }
): Promise<SecurityCheckResult> {
  // Check basic authentication
  if (options.requireAuth !== false) {
    const authResult = await requireAuth();
    if (!authResult.allowed) {
      return authResult;
    }
  }

  // Check email verification
  if (options.requireEmailVerified) {
    const emailResult = await requireEmailVerified();
    if (!emailResult.allowed) {
      return emailResult;
    }
  }

  // Check onboarding completion
  if (options.requireOnboardingComplete) {
    const onboardingResult = await requireOnboardingComplete();
    if (!onboardingResult.allowed) {
      return onboardingResult;
    }
  }

  return {
    allowed: true,
    layer: 'authentication',
  };
}

// ============================================================================
// Auth State Subscription
// ============================================================================

export type AuthStateCallback = (state: AuthState) => void;

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function
 */
export function onAuthStateChange(callback: AuthStateCallback): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const state: AuthState = {
        user: session?.user || null,
        session: session
          ? {
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at || 0,
            }
          : null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      };
      callback(state);
    }
  );

  return () => subscription.unsubscribe();
}

// ============================================================================
// Error Messages for Authentication Failures
// ============================================================================

export function getAuthErrorMessage(reason: SecurityDeniedReason): string {
  switch (reason) {
    case 'not_authenticated':
      return 'Please sign in to continue.';
    case 'email_not_verified':
      return 'Please verify your email address to continue.';
    case 'onboarding_incomplete':
      return 'Please complete your profile setup to continue.';
    default:
      return 'Authentication required.';
  }
}

export function getAuthRedirectPath(reason: SecurityDeniedReason): string {
  switch (reason) {
    case 'not_authenticated':
      return '/auth';
    case 'email_not_verified':
      return '/auth?verify=true';
    case 'onboarding_incomplete':
      return '/onboarding';
    default:
      return '/auth';
  }
}
