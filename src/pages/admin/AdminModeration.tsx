import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Image as ImageIcon,
  User,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ModerationItem {
  id: string;
  resource_type: 'resource' | 'page' | 'user' | 'signup';
  resource_id: string;
  user_id: string;
  reason: string;
  auto_flagged: boolean;
  flag_metadata: any;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  user_email?: string;
  user_name?: string;
  preview?: {
    title?: string;
    description?: string;
    imageUrl?: string;
  };
}

export default function AdminModeration() {
  const { hasPermission, logActivity } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadModerationQueue();
    logActivity('page_view', 'admin_moderation');
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, activeTab]);

  async function loadModerationQueue() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('moderation_queue')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich items with additional data
      const enrichedItems = await Promise.all(
        (data || []).map(async (item) => {
          let preview = {};

          // Fetch preview data based on resource type
          if (item.resource_type === 'resource') {
            const { data: resource } = await supabase
              .from('resources')
              .select('title, description, file_url')
              .eq('id', item.resource_id)
              .single();

            if (resource) {
              preview = {
                title: resource.title,
                description: resource.description,
                imageUrl: resource.file_url,
              };
            }
          } else if (item.resource_type === 'page') {
            const { data: page } = await supabase
              .from('pages')
              .select('title, description')
              .eq('id', item.resource_id)
              .single();

            if (page) {
              preview = {
                title: page.title,
                description: page.description,
              };
            }
          }

          return {
            ...item,
            user_email: item.profiles?.email,
            user_name: item.profiles?.full_name,
            preview,
          };
        })
      );

      setItems(enrichedItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderation queue',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  function filterItems() {
    let filtered = [...items];

    if (activeTab !== 'all') {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    setFilteredItems(filtered);
  }

  function handleReviewItem(item: ModerationItem) {
    setSelectedItem(item);
    setReviewNotes('');
    setShowReviewDialog(true);
  }

  async function handleApprove() {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes || null,
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: 'Approved',
        description: 'Item has been approved',
      });

      logActivity('approve_moderation', 'moderation_queue', selectedItem.id);
      setShowReviewDialog(false);
      loadModerationQueue();
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve item',
        variant: 'destructive',
      });
    }
  }

  async function handleReject() {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes || null,
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: 'Rejected',
        description: 'Item has been rejected',
      });

      logActivity('reject_moderation', 'moderation_queue', selectedItem.id);
      setShowReviewDialog(false);
      loadModerationQueue();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject item',
        variant: 'destructive',
      });
    }
  }

  async function handleEscalate() {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('moderation_queue')
        .update({
          status: 'escalated',
          priority: 'high',
          notes: reviewNotes || null,
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: 'Escalated',
        description: 'Item has been escalated to high priority',
      });

      logActivity('escalate_moderation', 'moderation_queue', selectedItem.id);
      setShowReviewDialog(false);
      loadModerationQueue();
    } catch (error) {
      console.error('Error escalating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to escalate item',
        variant: 'destructive',
      });
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - time) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }

  function getResourceIcon(type: string) {
    switch (type) {
      case 'resource':
        return <FileText className="h-5 w-5" />;
      case 'page':
        return <ImageIcon className="h-5 w-5" />;
      case 'user':
        return <User className="h-5 w-5" />;
      default:
        return <Flag className="h-5 w-5" />;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  if (!hasPermission('content.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view content moderation.</p>
        </div>
      </AdminLayout>
    );
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const escalatedCount = items.filter((i) => i.status === 'escalated').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Moderation</h1>
            <p className="text-gray-500 mt-1">
              Review and moderate flagged content
            </p>
          </div>
          <Button onClick={loadModerationQueue} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{escalatedCount}</p>
                <p className="text-sm text-gray-500">Escalated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {items.filter((i) => i.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {items.filter((i) => i.status === 'rejected').length}
                </p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="escalated">
              Escalated {escalatedCount > 0 && `(${escalatedCount})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items to review</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={item.priority === 'high' ? 'border-red-300' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getResourceIcon(item.resource_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {item.resource_type}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority} priority
                            </Badge>
                            {item.auto_flagged && (
                              <Badge variant="secondary">Auto-flagged</Badge>
                            )}
                          </div>
                          {item.preview?.title && (
                            <h3 className="font-semibold text-lg mb-1">
                              {item.preview.title}
                            </h3>
                          )}
                          {item.preview?.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {item.preview.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By: {item.user_name || item.user_email}</span>
                            <span>Flagged: {formatTimeAgo(item.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {item.status === 'pending' && hasPermission('content.moderate') && (
                        <Button
                          onClick={() => handleReviewItem(item)}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Flagged Reason:
                      </p>
                      <p className="text-sm text-yellow-800">{item.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Flagged Content</DialogTitle>
              <DialogDescription>
                Approve, reject, or escalate this item
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Type:</span>{' '}
                      <span className="text-sm capitalize">{selectedItem.resource_type}</span>
                    </div>
                    {selectedItem.preview?.title && (
                      <div>
                        <span className="text-sm font-medium">Title:</span>{' '}
                        <span className="text-sm">{selectedItem.preview.title}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">User:</span>{' '}
                      <span className="text-sm">{selectedItem.user_email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Reason:</span>{' '}
                      <span className="text-sm">{selectedItem.reason}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Review Notes (Optional)
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleEscalate}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalate
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
