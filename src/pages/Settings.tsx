import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, CreditCard, Download, Trash2, AlertTriangle, ExternalLink, Crown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { createPortalSession } from "@/lib/stripe";
import { UsernameSelector } from "@/components/UsernameSelector";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { subscription, getPlanName, hasFeature } = useSubscription();
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_on_signup: true,
    email_on_download: false,
    email_on_page_view: false,
    weekly_digest: true,
    webhook_failures: true,
    digest_frequency: 'weekly' as 'daily' | 'weekly' | 'never'
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, notification_preferences')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setUsername(profile.username || "");
        setIsUsernameValid(!!profile.username);

        // Load notification preferences if they exist
        if (profile.notification_preferences) {
          setNotificationPrefs({
            email_on_signup: profile.notification_preferences.email_on_signup ?? true,
            email_on_download: profile.notification_preferences.email_on_download ?? false,
            email_on_page_view: profile.notification_preferences.email_on_page_view ?? false,
            weekly_digest: profile.notification_preferences.weekly_digest ?? true,
            webhook_failures: profile.notification_preferences.webhook_failures ?? true,
            digest_frequency: profile.notification_preferences.digest_frequency ?? 'weekly'
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: { full_name: string; username?: string } = { full_name: fullName };
      
      // Only update username if it's valid and changed
      if (username && isUsernameValid) {
        updateData.username = username;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notificationPrefs
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save preferences",
        description: error.message || "Could not save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all user data
      const [profile, resources, pages, emailCaptures] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('resources').select('*').eq('user_id', user.id),
        supabase.from('pages').select('*').eq('user_id', user.id),
        supabase.from('email_captures').select('*').in('page_id',
          (await supabase.from('pages').select('id').eq('user_id', user.id)).data?.map(p => p.id) || []
        ),
      ]);

      const exportData = {
        profile: profile.data,
        resources: resources.data,
        pages: pages.data,
        email_captures: emailCaptures.data,
        exported_at: new Date().toISOString(),
      };

      // Create JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sharekit-data-${user.id}-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export your data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete user resources from storage
      const { data: resources } = await supabase
        .from('resources')
        .select('file_url')
        .eq('user_id', user.id);

      if (resources) {
        for (const resource of resources) {
          const filePath = resource.file_url.split('/').slice(-2).join('/');
          await supabase.storage.from('resources').remove([filePath]);
        }
      }

      // Delete all user data (cascading will handle related records)
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out and delete auth account
      await supabase.auth.admin.deleteUser(user.id);

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete your account",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <UsernameSelector
                    value={username}
                    onChange={setUsername}
                    onValidationChange={setIsUsernameValid}
                  />

                  <Button
                    type="submit"
                    disabled={isSaving || (username && !isUsernameValid)}
                    className="bg-gradient-ocean hover:opacity-90"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Choose which events trigger email notifications
                    </p>
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex-1">
                      <Label htmlFor="email-signup" className="text-sm font-medium">
                        New Signups
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when someone captures their email on your pages
                      </p>
                    </div>
                    <Switch
                      id="email-signup"
                      checked={notificationPrefs.email_on_signup}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, email_on_signup: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex-1">
                      <Label htmlFor="email-download" className="text-sm font-medium">
                        Resource Downloads
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when someone downloads your resources
                      </p>
                    </div>
                    <Switch
                      id="email-download"
                      checked={notificationPrefs.email_on_download}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, email_on_download: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex-1">
                      <Label htmlFor="email-pageview" className="text-sm font-medium">
                        Page Views
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about page views (included in digest only)
                      </p>
                    </div>
                    <Switch
                      id="email-pageview"
                      checked={notificationPrefs.email_on_page_view}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, email_on_page_view: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex-1">
                      <Label htmlFor="webhook-failures" className="text-sm font-medium">
                        Webhook Failures
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified immediately when webhook deliveries fail
                      </p>
                    </div>
                    <Switch
                      id="webhook-failures"
                      checked={notificationPrefs.webhook_failures}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, webhook_failures: checked})
                      }
                    />
                  </div>
                </div>

                {/* Digest Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Digest Emails</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Receive a summary of your activity instead of individual emails
                    </p>
                  </div>

                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex-1">
                      <Label htmlFor="weekly-digest" className="text-sm font-medium">
                        Enable Activity Digest
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive a summary email with your stats and activity
                      </p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={notificationPrefs.weekly_digest}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({...notificationPrefs, weekly_digest: checked})
                      }
                    />
                  </div>

                  {notificationPrefs.weekly_digest && (
                    <div className="space-y-2 pl-4">
                      <Label htmlFor="digest-frequency" className="text-sm">
                        Digest Frequency
                      </Label>
                      <Select
                        value={notificationPrefs.digest_frequency}
                        onValueChange={(value: 'daily' | 'weekly' | 'never') =>
                          setNotificationPrefs({...notificationPrefs, digest_frequency: value})
                        }
                      >
                        <SelectTrigger id="digest-frequency" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily (every morning)</SelectItem>
                          <SelectItem value="weekly">Weekly (every Monday)</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotifications}
                    className="w-full"
                  >
                    {isSavingNotifications ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy & GDPR</CardTitle>
                  <CardDescription>
                    Download or delete your personal data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Export Data */}
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Your Data
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download all your account data, resources, pages, and email captures in JSON format.
                        This is your right under GDPR.
                      </p>
                      <Button
                        onClick={handleExportData}
                        disabled={isExporting}
                        variant="outline"
                        size="sm"
                      >
                        {isExporting ? "Exporting..." : "Download My Data"}
                      </Button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="flex items-start justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-600 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                        All your resources, pages, and email captures will be permanently removed.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete My Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account,
                              remove all your data from our servers, and delete all uploaded resources.
                              <br /><br />
                              <strong>You will lose access to:</strong>
                              <ul className="list-disc pl-5 mt-2">
                                <li>All uploaded resources and files</li>
                                <li>All created pages and landing pages</li>
                                <li>All collected email captures</li>
                                <li>Your account settings and preferences</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Information</CardTitle>
                  <CardDescription>
                    Learn about how we protect your data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We take your privacy seriously. All your data is encrypted and stored securely.
                    You have full control over your data and can export or delete it at any time.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/privacy">
                        View Privacy Policy
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/terms">
                        View Terms of Service
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className={`p-6 rounded-lg ${subscription?.plan === 'free' ? 'bg-gradient-ocean' : 'bg-gradient-to-br from-purple-500 to-indigo-600'} text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {subscription?.plan !== 'free' && <Crown className="w-5 h-5" />}
                        <h3 className="text-xl font-bold">{getPlanName()} Plan</h3>
                      </div>
                      {subscription?.plan === 'free' && (
                        <Button asChild variant="secondary" size="sm">
                          <Link to="/pricing">
                            Upgrade to Pro
                          </Link>
                        </Button>
                      )}
                    </div>

                    {subscription && (
                      <div className="space-y-2 text-sm opacity-90">
                        <div className="flex justify-between">
                          <span>Pages</span>
                          <span className="font-medium">
                            {subscription.usage.pages} / {subscription.limits.pages === Infinity ? '∞' : subscription.limits.pages}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Signups this month</span>
                          <span className="font-medium">
                            {subscription.usage.signups_this_month} / {subscription.limits.signups_per_month}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>File upload limit</span>
                          <span className="font-medium">{subscription.limits.file_size_mb}MB</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {subscription && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-slate-900">Included Features</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>✓ Beautiful landing pages</li>
                          <li>✓ Email capture & delivery</li>
                          <li>✓ Real-time notifications</li>
                          <li>✓ Basic analytics</li>
                          {hasFeature('remove_branding') && <li>✓ Remove ShareKit branding</li>}
                          {hasFeature('ai_features') && <li>✓ AI-powered tools</li>}
                          {hasFeature('analytics_advanced') && <li>✓ Advanced analytics</li>}
                          {hasFeature('custom_domain') && <li>✓ Custom domain</li>}
                        </ul>
                      </div>

                      {subscription.plan === 'free' && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-slate-900">Unlock with Pro</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Unlimited pages</li>
                            <li>• 1,000 signups/month</li>
                            <li>• Remove branding</li>
                            <li>• AI-powered tools</li>
                            <li>• Advanced analytics</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Portal Link */}
                  {subscription && subscription.plan !== 'free' && subscription.stripe_customer_id && (
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-sm text-slate-900 mb-3">Payment Management</h4>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            toast({
                              title: "Opening customer portal...",
                              description: "You'll be redirected to manage your subscription",
                            });
                            const url = await createPortalSession();
                            window.location.href = url;
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: error instanceof Error ? error.message : "Failed to open customer portal",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Subscription & Billing
                      </Button>
                      <p className="text-xs text-slate-600 mt-2">
                        Update payment method, view invoices, or cancel subscription
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
