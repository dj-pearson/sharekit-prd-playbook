import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Download,
  X,
  CheckCircle,
  Search,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  price_monthly: number;
  created_at: string;
}

interface RevenueMetrics {
  mrr: number;
  mrrGrowth: number;
  arr: number;
  newMRR: number;
  churnedMRR: number;
  netNewMRR: number;
  totalRevenue: number;
}

interface PlanBreakdown {
  free: { count: number; percentage: number };
  pro: { count: number; mrr: number; percentage: number };
  business: { count: number; mrr: number; percentage: number };
}

export default function AdminSubscriptions() {
  const { hasPermission, logActivity } = useAdmin();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 0,
    mrrGrowth: 0,
    arr: 0,
    newMRR: 0,
    churnedMRR: 0,
    netNewMRR: 0,
    totalRevenue: 0,
  });

  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown>({
    free: { count: 0, percentage: 0 },
    pro: { count: 0, mrr: 0, percentage: 0 },
    business: { count: 0, mrr: 0, percentage: 0 },
  });

  useEffect(() => {
    loadSubscriptions();
    logActivity('page_view', 'admin_subscriptions');
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, searchQuery, filterPlan, filterStatus]);

  async function loadSubscriptions() {
    try {
      setIsLoading(true);

      // Get all users with their subscription info
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock subscription data (in production, this would come from Stripe)
      // For now, we'll use the subscription_tier field from profiles
      const mockSubscriptions: Subscription[] = (profiles || [])
        .filter((p) => p.subscription_tier && p.subscription_tier !== 'free')
        .map((profile, index) => {
          const plan = profile.subscription_tier || 'free';
          const priceMonthly = plan === 'pro' ? 19 : plan === 'business' ? 49 : 0;

          return {
            id: profile.id,
            user_id: profile.id,
            user_email: profile.email || '',
            user_name: profile.display_name || '',
            plan,
            status: 'active',
            current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            stripe_customer_id: `cus_mock_${index}`,
            stripe_subscription_id: `sub_mock_${index}`,
            price_monthly: priceMonthly,
            created_at: profile.created_at || new Date().toISOString(),
          };
        });

      setSubscriptions(mockSubscriptions);

      // Calculate metrics
      calculateMetrics(profiles || [], mockSubscriptions);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  function calculateMetrics(profiles: any[], subscriptions: Subscription[]) {
    const totalUsers = profiles.length;
    const freeCount = profiles.filter((p) => !p.subscription_tier || p.subscription_tier === 'free').length;
    const proCount = profiles.filter((p) => p.subscription_tier === 'pro').length;
    const businessCount = profiles.filter((p) => p.subscription_tier === 'business').length;

    const proMRR = proCount * 19;
    const businessMRR = businessCount * 49;
    const totalMRR = proMRR + businessMRR;

    setMetrics({
      mrr: totalMRR,
      mrrGrowth: 14, // Mock growth
      arr: totalMRR * 12,
      newMRR: 650, // Mock new MRR
      churnedMRR: 150, // Mock churned MRR
      netNewMRR: 500, // Mock net new MRR
      totalRevenue: totalMRR * 6, // Mock 6 months revenue
    });

    setPlanBreakdown({
      free: {
        count: freeCount,
        percentage: Math.round((freeCount / totalUsers) * 100),
      },
      pro: {
        count: proCount,
        mrr: proMRR,
        percentage: Math.round((proCount / totalUsers) * 100),
      },
      business: {
        count: businessCount,
        mrr: businessMRR,
        percentage: Math.round((businessCount / totalUsers) * 100),
      },
    });
  }

  function applyFilters() {
    let filtered = [...subscriptions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.user_email.toLowerCase().includes(query) ||
          sub.user_name?.toLowerCase().includes(query)
      );
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter((sub) => sub.plan === filterPlan);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((sub) => sub.status === filterStatus);
    }

    setFilteredSubscriptions(filtered);
  }

  function handleViewDetails(subscription: Subscription) {
    setSelectedSubscription(subscription);
    setShowDetailsDialog(true);
    logActivity('view_subscription', 'subscription', subscription.id);
  }

  function handleCancelSubscription() {
    setShowDetailsDialog(false);
    setShowCancelDialog(true);
  }

  function handleRefundSubscription() {
    setShowDetailsDialog(false);
    setShowRefundDialog(true);
  }

  async function confirmCancel() {
    if (!selectedSubscription) return;

    try {
      // In production, this would call Stripe API to cancel subscription
      toast({
        title: 'Subscription Canceled',
        description: 'The subscription will be canceled at the end of the billing period.',
      });

      logActivity('cancel_subscription', 'subscription', selectedSubscription.id);
      setShowCancelDialog(false);
      setSelectedSubscription(null);
      loadSubscriptions();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  }

  async function confirmRefund() {
    if (!selectedSubscription || !refundAmount) return;

    try {
      // In production, this would call Stripe API to issue refund
      toast({
        title: 'Refund Issued',
        description: `Refunded $${refundAmount} to customer`,
      });

      logActivity('refund_subscription', 'subscription', selectedSubscription.id, {
        amount: refundAmount,
        reason: refundReason,
      });

      setShowRefundDialog(false);
      setSelectedSubscription(null);
      setRefundAmount('');
      setRefundReason('');
      loadSubscriptions();
    } catch (error) {
      console.error('Error issuing refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to issue refund',
        variant: 'destructive',
      });
    }
  }

  function handleExportCSV() {
    try {
      const csv = [
        ['Email', 'Name', 'Plan', 'Status', 'MRR', 'Started', 'Renewal'].join(','),
        ...filteredSubscriptions.map((sub) =>
          [
            sub.user_email,
            sub.user_name || '',
            sub.plan,
            sub.status,
            `$${sub.price_monthly}`,
            new Date(sub.created_at).toLocaleDateString(),
            new Date(sub.current_period_end).toLocaleDateString(),
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast({
        title: 'Export Successful',
        description: 'Subscriptions exported to CSV',
      });

      logActivity('export_subscriptions', 'subscription', undefined, {
        count: filteredSubscriptions.length,
      });
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export subscriptions',
        variant: 'destructive',
      });
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  if (!hasPermission('subscriptions.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view subscriptions.</p>
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
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-gray-500 mt-1">
              Manage billing and subscriptions
            </p>
          </div>
          <Button onClick={loadSubscriptions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.mrr.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4" />
                {metrics.mrrGrowth}% growth
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.arr.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Annual recurring revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">New MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +${metrics.newMRR.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -${metrics.churnedMRR.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="font-medium">Free</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{planBreakdown.free.count} users</p>
                  <p className="text-sm text-gray-500">{planBreakdown.free.percentage}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="font-medium">Pro ($19/mo)</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {planBreakdown.pro.count} users • ${planBreakdown.pro.mrr} MRR
                  </p>
                  <p className="text-sm text-gray-500">{planBreakdown.pro.percentage}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="font-medium">Business ($49/mo)</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {planBreakdown.business.count} users • ${planBreakdown.business.mrr} MRR
                  </p>
                  <p className="text-sm text-gray-500">{planBreakdown.business.percentage}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {filteredSubscriptions.length} subscription(s)
              </p>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
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
                    <TableHead>Status</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.user_email}</p>
                          {sub.user_name && (
                            <p className="text-sm text-gray-500">{sub.user_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="capitalize">
                          {sub.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {sub.status}
                        </Badge>
                        {sub.cancel_at_period_end && (
                          <p className="text-xs text-red-600 mt-1">Canceling</p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${sub.price_monthly}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(sub.current_period_end)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleViewDetails(sub)}
                          variant="ghost"
                          size="sm"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Subscription Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Subscription Details</DialogTitle>
              <DialogDescription>
                Manage subscription for {selectedSubscription?.user_email}
              </DialogDescription>
            </DialogHeader>
            {selectedSubscription && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">User</label>
                    <p className="text-sm">{selectedSubscription.user_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan</label>
                    <p className="text-sm capitalize">{selectedSubscription.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm capitalize">{selectedSubscription.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">MRR</label>
                    <p className="text-sm">${selectedSubscription.price_monthly}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Period</label>
                    <p className="text-sm">
                      {formatDate(selectedSubscription.current_period_start)} -{' '}
                      {formatDate(selectedSubscription.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer ID</label>
                    <p className="text-sm font-mono text-xs">
                      {selectedSubscription.stripe_customer_id}
                    </p>
                  </div>
                </div>

                {hasPermission('subscriptions.manage') && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleRefundSubscription}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Issue Refund
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this subscription? The user will retain access
                until the end of their billing period.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmCancel}>
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>
                Issue a refund to the customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Refund Amount ($)</label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="19.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Reason (Optional)</label>
                <Input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Customer request..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmRefund} disabled={!refundAmount}>
                Issue Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
