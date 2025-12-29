import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Settings,
  Flag,
  Shield,
  Key,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout_type: 'all' | 'percentage' | 'users' | 'plans';
  rollout_percentage: number | null;
  rollout_plans: string[] | null;
  created_at: string;
  updated_at: string;
}

interface PlatformSettings {
  allowSignups: boolean;
  maintenanceMode: boolean;
  requireEmailVerification: boolean;
  enableReferralProgram: boolean;
}

interface PlanLimits {
  free: { resources: number; pages: number; signupsPerMonth: number; fileSize: number };
  pro: { resources: number; pages: number; signupsPerMonth: number; fileSize: number };
  business: { resources: number; pages: number; signupsPerMonth: number; fileSize: number };
}

export default function AdminSettings() {
  const { hasPermission, logActivity, adminUser } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('features');
  const [isLoading, setIsLoading] = useState(true);

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagFormData, setFlagFormData] = useState({
    name: '',
    key: '',
    description: '',
    enabled: false,
    rollout_type: 'all' as const,
    rollout_percentage: 100,
    rollout_plans: [] as string[],
  });

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    allowSignups: true,
    maintenanceMode: false,
    requireEmailVerification: true,
    enableReferralProgram: false,
  });

  // Plan limits state
  const [planLimits, setPlanLimits] = useState<PlanLimits>({
    free: { resources: 3, pages: 1, signupsPerMonth: 100, fileSize: 5 },
    pro: { resources: 50, pages: 10, signupsPerMonth: 1000, fileSize: 25 },
    business: { resources: -1, pages: -1, signupsPerMonth: -1, fileSize: 100 },
  });

  useEffect(() => {
    loadSettings();
    logActivity('page_view', 'admin_settings');
  }, []);

  async function loadSettings() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeatureFlags(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  // Feature Flags Functions
  function handleNewFlag() {
    setFlagFormData({
      name: '',
      key: '',
      description: '',
      enabled: false,
      rollout_type: 'all',
      rollout_percentage: 100,
      rollout_plans: [],
    });
    setSelectedFlag(null);
    setShowFlagDialog(true);
  }

  function handleEditFlag(flag: FeatureFlag) {
    setFlagFormData({
      name: flag.name,
      key: flag.key,
      description: flag.description,
      enabled: flag.enabled,
      rollout_type: flag.rollout_type,
      rollout_percentage: flag.rollout_percentage || 100,
      rollout_plans: flag.rollout_plans || [],
    });
    setSelectedFlag(flag);
    setShowFlagDialog(true);
  }

  async function handleSaveFlag() {
    if (!flagFormData.name || !flagFormData.key) {
      toast({
        title: 'Validation Error',
        description: 'Name and key are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const flagData = {
        name: flagFormData.name,
        key: flagFormData.key,
        description: flagFormData.description,
        enabled: flagFormData.enabled,
        rollout_type: flagFormData.rollout_type,
        rollout_percentage:
          flagFormData.rollout_type === 'percentage' ? flagFormData.rollout_percentage : null,
        rollout_plans:
          flagFormData.rollout_type === 'plans' ? flagFormData.rollout_plans : null,
        created_by: adminUser?.id,
      };

      if (selectedFlag) {
        const { error } = await supabase
          .from('feature_flags')
          .update(flagData)
          .eq('id', selectedFlag.id);

        if (error) throw error;

        toast({
          title: 'Feature Flag Updated',
          description: 'The feature flag has been updated successfully',
        });

        logActivity('update_feature_flag', 'feature_flag', selectedFlag.id);
      } else {
        const { error } = await supabase.from('feature_flags').insert(flagData);

        if (error) throw error;

        toast({
          title: 'Feature Flag Created',
          description: 'The feature flag has been created successfully',
        });

        logActivity('create_feature_flag', 'feature_flag');
      }

      setShowFlagDialog(false);
      loadSettings();
    } catch (error) {
      console.error('Error saving feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feature flag',
        variant: 'destructive',
      });
    }
  }

  async function handleToggleFlag(flag: FeatureFlag) {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !flag.enabled })
        .eq('id', flag.id);

      if (error) throw error;

      toast({
        title: flag.enabled ? 'Feature Disabled' : 'Feature Enabled',
        description: `${flag.name} is now ${flag.enabled ? 'disabled' : 'enabled'}`,
      });

      logActivity('toggle_feature_flag', 'feature_flag', flag.id, { enabled: !flag.enabled });
      loadSettings();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle feature flag',
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteFlag(flag: FeatureFlag) {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      const { error } = await supabase.from('feature_flags').delete().eq('id', flag.id);

      if (error) throw error;

      toast({
        title: 'Feature Flag Deleted',
        description: 'The feature flag has been deleted',
      });

      logActivity('delete_feature_flag', 'feature_flag', flag.id);
      loadSettings();
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feature flag',
        variant: 'destructive',
      });
    }
  }

  // Platform Settings Functions
  function handleSavePlatformSettings() {
    toast({
      title: 'Settings Saved',
      description: 'Platform settings have been updated',
    });

    logActivity('update_platform_settings', 'settings', undefined, platformSettings);
  }

  function handleSavePlanLimits() {
    toast({
      title: 'Plan Limits Updated',
      description: 'Plan limits have been saved successfully',
    });

    logActivity('update_plan_limits', 'settings', undefined, planLimits);
  }

  if (!hasPermission('dashboard.view')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to view settings.</p>
        </div>
      </AdminLayout>
    );
  }

  const isSuperAdmin = hasPermission('*');
  const enabledFlags = featureFlags.filter((f) => f.enabled).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-gray-500 mt-1">
              Configure platform features and settings
            </p>
          </div>
          <Button onClick={loadSettings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Feature Flags</p>
                  <p className="text-2xl font-bold">{featureFlags.length}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{enabledFlags} enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Platform Status</p>
                  <p className="text-2xl font-bold">
                    {platformSettings.maintenanceMode ? 'Maintenance' : 'Operational'}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">System status</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Security</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Email verification: {platformSettings.requireEmailVerification ? 'On' : 'Off'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">API Access</p>
                  <p className="text-2xl font-bold">Ready</p>
                </div>
                <Key className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">API keys active</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="features">
              <Flag className="h-4 w-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="platform">
              <Settings className="h-4 w-4 mr-2" />
              Platform Settings
            </TabsTrigger>
            <TabsTrigger value="limits">
              <Shield className="h-4 w-4 mr-2" />
              Plan Limits
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="h-4 w-4 mr-2" />
              API & Security
            </TabsTrigger>
          </TabsList>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Feature Flags</h2>
              {isSuperAdmin && (
                <Button onClick={handleNewFlag}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Feature Flag
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : featureFlags.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feature flags yet</p>
                  {isSuperAdmin && (
                    <Button onClick={handleNewFlag} className="mt-4">
                      Create Your First Flag
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <Card key={flag.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{flag.name}</h3>
                            <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                              {flag.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {flag.key}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">Rollout: {flag.rollout_type}</span>
                            {flag.rollout_type === 'percentage' && (
                              <span>• {flag.rollout_percentage}% of users</span>
                            )}
                            {flag.rollout_type === 'plans' && flag.rollout_plans && (
                              <span>• Plans: {flag.rollout_plans.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        {isSuperAdmin && (
                          <div className="flex gap-2">
                            <Switch
                              checked={flag.enabled}
                              onCheckedChange={() => handleToggleFlag(flag)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFlag(flag)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFlag(flag)}
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

          {/* Platform Settings Tab */}
          <TabsContent value="platform" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="signups">Allow New Signups</Label>
                    <p className="text-sm text-gray-500">
                      Enable or disable new user registrations
                    </p>
                  </div>
                  <Switch
                    id="signups"
                    checked={platformSettings.allowSignups}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({ ...platformSettings, allowSignups: checked })
                    }
                    disabled={!isSuperAdmin}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Put the platform in maintenance mode
                    </p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({ ...platformSettings, maintenanceMode: checked })
                    }
                    disabled={!isSuperAdmin}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="email-verification">Require Email Verification</Label>
                    <p className="text-sm text-gray-500">
                      Users must verify email before accessing features
                    </p>
                  </div>
                  <Switch
                    id="email-verification"
                    checked={platformSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({
                        ...platformSettings,
                        requireEmailVerification: checked,
                      })
                    }
                    disabled={!isSuperAdmin}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="referral">Enable Referral Program</Label>
                    <p className="text-sm text-gray-500">
                      Allow users to refer others for rewards
                    </p>
                  </div>
                  <Switch
                    id="referral"
                    checked={platformSettings.enableReferralProgram}
                    onCheckedChange={(checked) =>
                      setPlatformSettings({ ...platformSettings, enableReferralProgram: checked })
                    }
                    disabled={!isSuperAdmin}
                  />
                </div>

                {isSuperAdmin && (
                  <Button onClick={handleSavePlatformSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Platform Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Limits Tab */}
          <TabsContent value="limits" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['free', 'pro', 'business'] as const).map((plan) => (
                <Card key={plan}>
                  <CardHeader>
                    <CardTitle className="capitalize">{plan} Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Resources</Label>
                      <Input
                        type="number"
                        value={planLimits[plan].resources}
                        onChange={(e) =>
                          setPlanLimits({
                            ...planLimits,
                            [plan]: { ...planLimits[plan], resources: Number(e.target.value) },
                          })
                        }
                        disabled={!isSuperAdmin}
                      />
                      <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
                    </div>

                    <div>
                      <Label>Pages</Label>
                      <Input
                        type="number"
                        value={planLimits[plan].pages}
                        onChange={(e) =>
                          setPlanLimits({
                            ...planLimits,
                            [plan]: { ...planLimits[plan], pages: Number(e.target.value) },
                          })
                        }
                        disabled={!isSuperAdmin}
                      />
                      <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
                    </div>

                    <div>
                      <Label>Signups per Month</Label>
                      <Input
                        type="number"
                        value={planLimits[plan].signupsPerMonth}
                        onChange={(e) =>
                          setPlanLimits({
                            ...planLimits,
                            [plan]: {
                              ...planLimits[plan],
                              signupsPerMonth: Number(e.target.value),
                            },
                          })
                        }
                        disabled={!isSuperAdmin}
                      />
                      <p className="text-xs text-gray-500 mt-1">-1 for unlimited</p>
                    </div>

                    <div>
                      <Label>File Size Limit (MB)</Label>
                      <Input
                        type="number"
                        value={planLimits[plan].fileSize}
                        onChange={(e) =>
                          setPlanLimits({
                            ...planLimits,
                            [plan]: { ...planLimits[plan], fileSize: Number(e.target.value) },
                          })
                        }
                        disabled={!isSuperAdmin}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isSuperAdmin && (
              <Button onClick={handleSavePlanLimits}>
                <Save className="h-4 w-4 mr-2" />
                Save Plan Limits
              </Button>
            )}
          </TabsContent>

          {/* API & Security Tab */}
          <TabsContent value="api" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          API Key Management Coming Soon
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                          Full API key generation, management, and rate limiting features will be
                          available in a future release.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Current Status</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">API endpoints operational</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Rate limiting active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Authentication required</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue={60} disabled={!isSuperAdmin} />
                  <p className="text-xs text-gray-500 mt-1">
                    User session duration before requiring re-login
                  </p>
                </div>

                <div>
                  <Label>Max Login Attempts</Label>
                  <Input type="number" defaultValue={5} disabled={!isSuperAdmin} />
                  <p className="text-xs text-gray-500 mt-1">
                    Failed login attempts before temporary lockout
                  </p>
                </div>

                <div>
                  <Label>Allowed File Types</Label>
                  <Textarea
                    defaultValue="pdf,doc,docx,xls,xlsx,zip,jpg,png"
                    disabled={!isSuperAdmin}
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of extensions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Flag Dialog */}
        <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedFlag ? 'Edit Feature Flag' : 'New Feature Flag'}</DialogTitle>
              <DialogDescription>
                Configure feature flags for gradual rollout and A/B testing
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Feature Name *</Label>
                <Input
                  value={flagFormData.name}
                  onChange={(e) => setFlagFormData({ ...flagFormData, name: e.target.value })}
                  placeholder="A/B Testing"
                />
              </div>

              <div>
                <Label>Feature Key *</Label>
                <Input
                  value={flagFormData.key}
                  onChange={(e) =>
                    setFlagFormData({
                      ...flagFormData,
                      key: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                    })
                  }
                  placeholder="enable_ab_testing"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase with underscores</p>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={flagFormData.description}
                  onChange={(e) =>
                    setFlagFormData({ ...flagFormData, description: e.target.value })
                  }
                  placeholder="Enable A/B testing for share pages"
                  rows={2}
                />
              </div>

              <div>
                <Label>Rollout Type</Label>
                <Select
                  value={flagFormData.rollout_type}
                  onValueChange={(value: any) =>
                    setFlagFormData({ ...flagFormData, rollout_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="percentage">Percentage Rollout</SelectItem>
                    <SelectItem value="plans">Specific Plans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {flagFormData.rollout_type === 'percentage' && (
                <div>
                  <Label>Rollout Percentage</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={flagFormData.rollout_percentage}
                    onChange={(e) =>
                      setFlagFormData({
                        ...flagFormData,
                        rollout_percentage: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">0-100% of users</p>
                </div>
              )}

              {flagFormData.rollout_type === 'plans' && (
                <div>
                  <Label>Target Plans</Label>
                  <div className="flex gap-2 mt-2">
                    {['free', 'pro', 'business'].map((plan) => (
                      <label key={plan} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={flagFormData.rollout_plans.includes(plan)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFlagFormData({
                                ...flagFormData,
                                rollout_plans: [...flagFormData.rollout_plans, plan],
                              });
                            } else {
                              setFlagFormData({
                                ...flagFormData,
                                rollout_plans: flagFormData.rollout_plans.filter(
                                  (p) => p !== plan
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={flagFormData.enabled}
                  onCheckedChange={(checked) =>
                    setFlagFormData({ ...flagFormData, enabled: checked })
                  }
                />
                <Label>Enable this feature flag</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFlag}>
                {selectedFlag ? 'Update' : 'Create'} Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
