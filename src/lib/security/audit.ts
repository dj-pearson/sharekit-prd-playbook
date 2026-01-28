/**
 * Security Audit Logging
 *
 * Provides logging functionality for security-related events.
 * Logs are stored in the security_audit_log table for compliance and debugging.
 */

import { supabase } from '@/integrations/supabase/client';
import type { SecurityAuditEvent, SecurityCheckResult, SecurityDeniedReason } from './types';
import { getCurrentUser } from './authentication';

// ============================================================================
// Audit Event Types
// ============================================================================

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'session_expired'
  | 'permission_check'
  | 'permission_denied'
  | 'resource_access'
  | 'resource_denied'
  | 'resource_created'
  | 'resource_updated'
  | 'resource_deleted'
  | 'admin_action'
  | 'security_violation';

// ============================================================================
// Core Logging Function
// ============================================================================

/**
 * Log a security event to the audit log
 * This function is designed to be non-blocking and fail silently
 */
export async function logSecurityEvent(
  event: Omit<SecurityAuditEvent, 'timestamp'>
): Promise<void> {
  try {
    // Use RPC to call the security definer function
    // This bypasses RLS for audit logging
    await supabase.rpc('log_security_event', {
      p_user_id: event.userId,
      p_action: event.action,
      p_resource_type: event.resource,
      p_resource_id: event.resourceId || null,
      p_security_layer: event.layer,
      p_result: event.result,
      p_denied_reason: event.deniedReason || null,
      p_ip_address: event.ipAddress || null,
      p_user_agent: event.userAgent || null,
      p_metadata: event.metadata || {},
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the app
    console.error('Failed to log security event:', error);
  }
}

/**
 * Log a security event with automatic user detection
 */
export async function logSecurityEventAuto(
  action: AuditAction,
  resource: string,
  result: SecurityCheckResult,
  options: {
    resourceId?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const user = await getCurrentUser();

  await logSecurityEvent({
    userId: user?.id || null,
    action,
    resource,
    resourceId: options.resourceId,
    layer: result.layer || 'authentication',
    result: result.allowed ? 'allowed' : 'denied',
    deniedReason: result.deniedReason,
    metadata: {
      ...options.metadata,
      details: result.details,
    },
  });
}

// ============================================================================
// Convenience Logging Functions
// ============================================================================

/**
 * Log an authentication event
 */
export async function logAuthenticationEvent(
  action: 'login' | 'logout' | 'login_failed' | 'session_expired',
  success: boolean,
  options: {
    userId?: string;
    email?: string;
    provider?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  await logSecurityEvent({
    userId: options.userId || null,
    action,
    resource: 'authentication',
    layer: 'authentication',
    result: success ? 'allowed' : 'denied',
    deniedReason: success ? undefined : ('not_authenticated' as SecurityDeniedReason),
    metadata: {
      email: options.email,
      provider: options.provider,
      reason: options.reason,
      ...options.metadata,
    },
  });
}

/**
 * Log an authorization event
 */
export async function logAuthorizationEvent(
  action: 'permission_check' | 'permission_denied',
  result: SecurityCheckResult,
  options: {
    permission?: string;
    permissions?: string[];
    role?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const user = await getCurrentUser();

  await logSecurityEvent({
    userId: user?.id || null,
    action,
    resource: 'authorization',
    layer: 'authorization',
    result: result.allowed ? 'allowed' : 'denied',
    deniedReason: result.deniedReason,
    metadata: {
      permission: options.permission,
      permissions: options.permissions,
      role: options.role,
      details: result.details,
      ...options.metadata,
    },
  });
}

/**
 * Log a resource ownership event
 */
export async function logOwnershipEvent(
  action: 'resource_access' | 'resource_denied' | 'resource_created' | 'resource_updated' | 'resource_deleted',
  resourceType: string,
  resourceId: string,
  result: SecurityCheckResult,
  options: {
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  const user = await getCurrentUser();

  await logSecurityEvent({
    userId: user?.id || null,
    action,
    resource: resourceType,
    resourceId,
    layer: 'ownership',
    result: result.allowed ? 'allowed' : 'denied',
    deniedReason: result.deniedReason,
    metadata: {
      details: result.details,
      ...options.metadata,
    },
  });
}

// ============================================================================
// Audit Log Query Functions (for admin use)
// ============================================================================

export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  result?: 'allowed' | 'denied';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Query the audit log (admin only - RLS enforced)
 */
export async function queryAuditLog(
  query: AuditLogQuery
): Promise<{ logs: SecurityAuditEvent[]; count: number }> {
  let queryBuilder = supabase
    .from('security_audit_log')
    .select('*', { count: 'exact' });

  if (query.userId) {
    queryBuilder = queryBuilder.eq('user_id', query.userId);
  }

  if (query.action) {
    queryBuilder = queryBuilder.eq('action', query.action);
  }

  if (query.resource) {
    queryBuilder = queryBuilder.eq('resource_type', query.resource);
  }

  if (query.result) {
    queryBuilder = queryBuilder.eq('result', query.result);
  }

  if (query.startDate) {
    queryBuilder = queryBuilder.gte('timestamp', query.startDate.toISOString());
  }

  if (query.endDate) {
    queryBuilder = queryBuilder.lte('timestamp', query.endDate.toISOString());
  }

  queryBuilder = queryBuilder
    .order('timestamp', { ascending: false })
    .range(query.offset || 0, (query.offset || 0) + (query.limit || 50) - 1);

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('Error querying audit log:', error);
    return { logs: [], count: 0 };
  }

  const logs: SecurityAuditEvent[] = (data || []).map((row) => ({
    timestamp: row.timestamp,
    userId: row.user_id,
    action: row.action,
    resource: row.resource_type,
    resourceId: row.resource_id,
    layer: row.security_layer,
    result: row.result,
    deniedReason: row.denied_reason,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata: row.metadata,
  }));

  return { logs, count: count || 0 };
}

/**
 * Get security violations for a user (denied events)
 */
export async function getUserSecurityViolations(
  userId: string,
  limit: number = 10
): Promise<SecurityAuditEvent[]> {
  const { logs } = await queryAuditLog({
    userId,
    result: 'denied',
    limit,
  });

  return logs;
}

/**
 * Get recent security events for monitoring
 */
export async function getRecentSecurityEvents(
  limit: number = 100
): Promise<SecurityAuditEvent[]> {
  const { logs } = await queryAuditLog({ limit });
  return logs;
}

// ============================================================================
// Middleware Integration
// ============================================================================

/**
 * Create a logging wrapper for security checks
 * Automatically logs the result of security checks
 */
export function withAuditLogging<T extends (...args: unknown[]) => Promise<SecurityCheckResult>>(
  fn: T,
  action: AuditAction,
  resource: string
): T {
  return (async (...args: unknown[]) => {
    const result = await fn(...args);

    await logSecurityEventAuto(action, resource, result);

    return result;
  }) as T;
}
