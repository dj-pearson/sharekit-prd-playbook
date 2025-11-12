import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Megaphone,
  Mail,
  Plus,
  Send,
  Users,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  display_location: 'banner' | 'modal' | 'toast';
  target_audience: 'all' | 'free' | 'pro' | 'business';
  active: boolean;
  dismissible: boolean;
  cta_text: string | null;
  cta_url: string | null;
  starts_at: string;
  ends_at: string | null;
  view_count: number;
  click_count: number;
  dismissal_count: number;
  created_at: string;
}

export default function AdminMarketing() {
  const { hasPermission, logActivity, adminUser } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  const [isLoading, setIsLoading] = useState(true);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    display_location: 'banner' as const,
    target_audience: 'all' as const,
    dismissible: true,
    cta_text: '',
    cta_url: '',
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: '',
  });

  // Email campaign mock data
  const [campaigns] = useState([
    {
      id: '1',
      name: 'Welcome Series',
      type: 'automated',
      status: 'active',
      recipients: 150,
      sent: 1200,
      opened: 720,
      clicked: 180,
      openRate: 60,
      clickRate: 15,
    },
    {
      id: '2',
      name: 'Black Friday Promotion',
      type: 'one-time',
      status: 'scheduled',
      recipients: 247,
      sent: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0,
      scheduledFor: '2025-11-29',
    },
  ]);

  useEffect(() => {
    loadAnnouncements();
    logActivity('page_view', 'admin_marketing');
  }, []);

  async function loadAnnouncements() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnnouncements(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  function handleNewAnnouncement() {
    setAnnouncementFormData({
      title: '',
      message: '',
      type: 'info',
      display_location: 'banner',
      target_audience: 'all',
      dismissible: true,
      cta_text: '',
      cta_url: '',
      starts_at: new Date().toISOString().split('T')[0],
      ends_at: '',
    });
    setSelectedAnnouncement(null);
    setShowAnnouncementDialog(true);
  }

  function handleEditAnnouncement(announcement: Announcement) {
    setAnnouncementFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      display_location: announcement.display_location,
      target_audience: announcement.target_audience,
      dismissible: announcement.dismissible,
      cta_text: announcement.cta_text || '',
      cta_url: announcement.cta_url || '',
      starts_at: announcement.starts_at.split('T')[0],
      ends_at: announcement.ends_at ? announcement.ends_at.split('T')[0] : '',
    });
    setSelectedAnnouncement(announcement);
    setShowAnnouncementDialog(true);
  }

  async function handleSaveAnnouncement() {
    if (!announcementFormData.title || !announcementFormData.message) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const announcementData = {
        title: announcementFormData.title,
        message: announcementFormData.message,
        type: announcementFormData.type,
        display_location: announcementFormData.display_location,
        target_audience: announcementFormData.target_audience,
        dismissible: announcementFormData.dismissible,
        cta_text: announcementFormData.cta_text || null,
        cta_url: announcementFormData.cta_url || null,
        starts_at: new Date(announcementFormData.starts_at).toISOString(),
        ends_at: announcementFormData.ends_at
          ? new Date(announcementFormData.ends_at).toISOString()
          : null,
        active: true,
        created_by: adminUser?.id,
      };

      if (selectedAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', selectedAnnouncement.id);

        if (error) throw error;

        toast({
          title: 'Announcement Updated',
          description: 'The announcement has been updated successfully',
        });

        logActivity('update_announcement', 'announcement', selectedAnnouncement.id);
      } else {
        const { error } = await supabase.from('announcements').insert(announcementData);

        if (error) throw error;

        toast({
          title: 'Announcement Created',
          description: 'The announcement has been created successfully',
        });

        logActivity('create_announcement', 'announcement');
      }

      setShowAnnouncementDialog(false);
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save announcement',
        variant: 'destructive',
      });
    }
  }

  async function handleToggleActive(announcement: Announcement) {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active: !announcement.active })
        .eq('id', announcement.id);

      if (error) throw error;

      toast({
        title: announcement.active ? 'Announcement Deactivated' : 'Announcement Activated',
        description: `The announcement is now ${announcement.active ? 'inactive' : 'active'}`,
      });

      logActivity('toggle_announcement', 'announcement', announcement.id, {
        active: !announcement.active,
      });

      loadAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle announcement',
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteAnnouncement(announcement: Announcement) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id);

      if (error) throw error;

      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been deleted',
      });

      logActivity('delete_announcement', 'announcement', announcement.id);
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  }

  if (!hasPermission('cms.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view marketing tools.</p>
        </div>
      </AdminLayout>
    );
  }

  const activeAnnouncements = announcements.filter((a) => a.active).length;
  const totalViews = announcements.reduce((acc, a) => acc + a.view_count, 0);
  const totalClicks = announcements.reduce((acc, a) => acc + a.click_count, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketing Tools</h1>
            <p className="text-gray-500 mt-1">
              Manage campaigns and announcements
            </p>
          </div>
          <Button onClick={loadAnnouncements} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Announcements</p>
                  <p className="text-2xl font-bold">{activeAnnouncements}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Currently visible to users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Email Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Total campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Announcement impressions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">CTA Clicks</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Call-to-action engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="announcements">
              <Megaphone className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Mail className="h-4 w-4 mr-2" />
              Email Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Platform Announcements</h2>
              {hasPermission('cms.edit') && (
                <Button onClick={handleNewAnnouncement}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No announcements yet</p>
                  {hasPermission('cms.edit') && (
                    <Button onClick={handleNewAnnouncement} className="mt-4">
                      Create Your First Announcement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{announcement.title}</h3>
                            <Badge className={getTypeColor(announcement.type)}>
                              {announcement.type}
                            </Badge>
                            <Badge variant={announcement.active ? 'default' : 'secondary'}>
                              {announcement.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {announcement.target_audience}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {announcement.view_count} views
                            </span>
                            {announcement.cta_text && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {announcement.click_count} clicks
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(announcement.starts_at)} - {formatDate(announcement.ends_at)}
                            </span>
                          </div>
                        </div>
                        {hasPermission('cms.edit') && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(announcement)}
                            >
                              {announcement.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAnnouncement(announcement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnnouncement(announcement)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Email Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Campaigns</h2>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign (Coming Soon)
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant="outline" className="capitalize">
                            {campaign.type}
                          </Badge>
                          <Badge
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.recipients} recipients
                          </span>
                          {campaign.sent > 0 && (
                            <>
                              <span className="flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                {campaign.sent} sent
                              </span>
                              <span>
                                {campaign.openRate}% open rate
                              </span>
                              <span>
                                {campaign.clickRate}% click rate
                              </span>
                            </>
                          )}
                          {campaign.scheduledFor && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Scheduled: {new Date(campaign.scheduledFor).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Email Campaign Builder</strong> - Full email campaign functionality
                    with audience segmentation, templates, and analytics is planned for a future
                    release. These are preview examples.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Announcement Dialog */}
        <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </DialogTitle>
              <DialogDescription>
                Create in-app announcements for your users
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)]">
              <div className="space-y-4 pr-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    value={announcementFormData.title}
                    onChange={(e) =>
                      setAnnouncementFormData({ ...announcementFormData, title: e.target.value })
                    }
                    placeholder="Announcement title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <Textarea
                    value={announcementFormData.message}
                    onChange={(e) =>
                      setAnnouncementFormData({
                        ...announcementFormData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Announcement message..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={announcementFormData.type}
                      onValueChange={(value: any) =>
                        setAnnouncementFormData({ ...announcementFormData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Location</label>
                    <Select
                      value={announcementFormData.display_location}
                      onValueChange={(value: any) =>
                        setAnnouncementFormData({ ...announcementFormData, display_location: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="modal">Modal</SelectItem>
                        <SelectItem value="toast">Toast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Audience</label>
                  <Select
                    value={announcementFormData.target_audience}
                    onValueChange={(value: any) =>
                      setAnnouncementFormData({ ...announcementFormData, target_audience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="business">Business Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">CTA Text (Optional)</label>
                    <Input
                      value={announcementFormData.cta_text}
                      onChange={(e) =>
                        setAnnouncementFormData({
                          ...announcementFormData,
                          cta_text: e.target.value,
                        })
                      }
                      placeholder="Learn More"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">CTA URL (Optional)</label>
                    <Input
                      value={announcementFormData.cta_url}
                      onChange={(e) =>
                        setAnnouncementFormData({
                          ...announcementFormData,
                          cta_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Starts At *</label>
                    <Input
                      type="date"
                      value={announcementFormData.starts_at}
                      onChange={(e) =>
                        setAnnouncementFormData({
                          ...announcementFormData,
                          starts_at: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ends At (Optional)</label>
                    <Input
                      type="date"
                      value={announcementFormData.ends_at}
                      onChange={(e) =>
                        setAnnouncementFormData({
                          ...announcementFormData,
                          ends_at: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dismissible"
                    checked={announcementFormData.dismissible}
                    onChange={(e) =>
                      setAnnouncementFormData({
                        ...announcementFormData,
                        dismissible: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="dismissible" className="text-sm">
                    Allow users to dismiss this announcement
                  </label>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAnnouncement}>
                {selectedAnnouncement ? 'Update' : 'Create'} Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
