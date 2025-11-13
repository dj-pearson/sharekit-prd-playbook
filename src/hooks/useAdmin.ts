import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AdminRole = 'super_admin' | 'admin' | 'support_manager' | 'content_manager' | 'read_only';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: Record<string, boolean>;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseAdminReturn {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: AdminRole | AdminRole[]) => boolean;
  logActivity: (action: string, resourceType: string, resourceId?: string, metadata?: any) => Promise<void>;
}

// Permission matrix based on roles
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'], // All permissions

  admin: [
    'users.view', 'users.edit', 'users.delete',
    'content.view', 'content.moderate',
    'subscriptions.view', 'subscriptions.manage',
    'support.view', 'support.manage',
    'analytics.view',
    'cms.view', 'cms.edit'
  ],

  support_manager: [
    'users.view',
    'support.view', 'support.manage',
    'analytics.view'
  ],

  content_manager: [
    'cms.view', 'cms.edit', 'cms.publish',
    'help.view', 'help.edit', 'help.publish'
  ],

  read_only: [
    'dashboard.view',
    'analytics.view'
  ]
};

export function useAdmin(requireAdmin: boolean = true): UseAdminReturn {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (requireAdmin) {
          navigate('/auth');
        }
        setIsLoading(false);
        return;
      }

      // Check if user is an admin
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !admin) {
        if (requireAdmin) {
          toast({
            title: 'Access Denied',
            description: 'You do not have admin access.',
            variant: 'destructive',
          });
          navigate('/dashboard');
        }
        setIsLoading(false);
        return;
      }

      setAdminUser(admin as AdminUser);

      // Update last login time
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id);

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      if (requireAdmin) {
        navigate('/dashboard');
      }
      setIsLoading(false);
    }
  }

  function hasPermission(permission: string): boolean {
    if (!adminUser) return false;

    const rolePermissions = ROLE_PERMISSIONS[adminUser.role];

    // Super admin has all permissions
    if (rolePermissions.includes('*')) return true;

    // Check if permission exists in role permissions
    return rolePermissions.includes(permission);
  }

  function hasRole(roles: AdminRole | AdminRole[]): boolean {
    if (!adminUser) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(adminUser.role);
  }

  async function logActivity(
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: any
  ): Promise<void> {
    if (!adminUser) return;

    try {
      await supabase.from('admin_activity_log').insert({
        admin_id: adminUser.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  return {
    adminUser,
    isAdmin: !!adminUser,
    isLoading,
    hasPermission,
    hasRole,
    logActivity,
  };
}
