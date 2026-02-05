import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Download, Eye, Ban, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  subscription_plan: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  resource_count?: number;
  page_count?: number;
}

interface UserFilters {
  searchQuery: string;
  plan: string;
  status: string;
}

export default function AdminUsers() {
  const { hasPermission, logActivity } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    searchQuery: '',
    plan: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadUsers();
    logActivity('page_view', 'admin_users');
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  async function loadUsers() {
    try {
      setIsLoading(true);

      // Fetch users with profile data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch resource and page counts in batch (2 queries instead of N*2)
      const userIds = (profiles || []).map(p => p.id);

      const [resourcesResult, pagesResult] = await Promise.all([
        supabase.from('resources').select('user_id').in('user_id', userIds),
        supabase.from('pages').select('user_id').in('user_id', userIds),
      ]);

      // Aggregate counts client-side
      const resourceCounts: Record<string, number> = {};
      const pageCounts: Record<string, number> = {};

      (resourcesResult.data || []).forEach(r => {
        resourceCounts[r.user_id] = (resourceCounts[r.user_id] || 0) + 1;
      });

      (pagesResult.data || []).forEach(p => {
        pageCounts[p.user_id] = (pageCounts[p.user_id] || 0) + 1;
      });

      const usersWithCounts = (profiles || []).map(profile => ({
        ...profile,
        resource_count: resourceCounts[profile.id] || 0,
        page_count: pageCounts[profile.id] || 0,
      }));

      setUsers(usersWithCounts);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...users];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query)
      );
    }

    // Plan filter
    if (filters.plan !== 'all') {
      filtered = filtered.filter(
        (user) => (user.subscription_plan || 'free') === filters.plan
      );
    }

    // Status filter (active = signed in within last 30 days)
    if (filters.status !== 'all') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (filters.status === 'active') {
        filtered = filtered.filter(
          (user) =>
            user.last_sign_in_at &&
            new Date(user.last_sign_in_at) > thirtyDaysAgo
        );
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(
          (user) =>
            !user.last_sign_in_at ||
            new Date(user.last_sign_in_at) <= thirtyDaysAgo
        );
      }
    }

    setFilteredUsers(filtered);
  }

  function handleViewUser(user: UserData) {
    setSelectedUser(user);
    setShowUserDialog(true);
    logActivity('view_user', 'user', user.id);
  }

  async function handleExportUsers() {
    try {
      const csv = [
        ['Email', 'Display Name', 'Username', 'Plan', 'Created', 'Resources', 'Pages'].join(','),
        ...filteredUsers.map((user) =>
          [
            user.email,
            user.full_name || '',
            user.username || '',
            user.subscription_plan || 'free',
            new Date(user.created_at).toLocaleDateString(),
            user.resource_count || 0,
            user.page_count || 0,
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast({
        title: 'Export Successful',
        description: 'Users data exported to CSV',
      });

      logActivity('export_users', 'user', undefined, { count: filteredUsers.length });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export users data',
        variant: 'destructive',
      });
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  if (!hasPermission('users.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view users.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500 mt-1">
              Manage and monitor platform users
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email, name, or username..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <Select
                value={filters.plan}
                onValueChange={(value) => setFilters({ ...filters, plan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Found {filteredUsers.length} user(s)
              </p>
              <Button onClick={handleExportUsers} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          {user.full_name && (
                            <p className="text-sm text-gray-500">{user.full_name}</p>
                          )}
                          {user.username && (
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_plan === 'free' ? 'secondary' : 'default'}>
                          {user.subscription_plan || 'free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{user.resource_count || 0} resources</p>
                          <p className="text-gray-500">{user.page_count || 0} pages</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage user information
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm">{selectedUser.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-sm">{selectedUser.username || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan</label>
                    <p className="text-sm capitalize">{selectedUser.subscription_plan || 'free'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resources</label>
                    <p className="text-sm">{selectedUser.resource_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Pages</label>
                    <p className="text-sm">{selectedUser.page_count || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Active</label>
                    <p className="text-sm">{formatDate(selectedUser.last_sign_in_at)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {hasPermission('users.edit') && (
                    <Button variant="outline" size="sm">
                      Edit User
                    </Button>
                  )}
                  {hasPermission('users.delete') && (
                    <>
                      <Button variant="outline" size="sm">
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
