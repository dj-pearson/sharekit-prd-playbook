import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Users, Eye, FileText, Upload, CheckCircle, Copy, ExternalLink, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { RealtimeActivityFeed } from "@/components/RealtimeActivityFeed";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageWarning } from "@/components/UpgradePrompt";

interface DashboardStats {
  totalViews: number;
  totalSignups: number;
  signupRate: number;
  hasPages: boolean;
  hasResources: boolean;
  hasFirstSignup: boolean;
}

interface RecentPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  view_count: number;
  created_at: string;
}

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalSignups: 0,
    signupRate: 0,
    hasPages: false,
    hasResources: false,
    hasFirstSignup: false,
  });
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { subscription } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    checkOnboarding();
    loadDashboardStats();
    loadRecentPages();
  }, []);

  const checkOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get user's resources
      const { count: resourceCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const hasResources = (resourceCount || 0) > 0;

      // Get user's pages
      const { data: pages } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id);

      if (!pages || pages.length === 0) {
        setStats({
          totalViews: 0,
          totalSignups: 0,
          signupRate: 0,
          hasPages: false,
          hasResources,
          hasFirstSignup: false,
        });
        return;
      }

      const pageIds = pages.map(p => p.id);

      // Get analytics events from last 30 days
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('page_id', pageIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Check if user has ever received a signup (not just last 30 days)
      const { count: totalSignupCount } = await supabase
        .from('email_captures')
        .select('*', { count: 'exact', head: true })
        .in('page_id', pageIds);

      const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
      const totalSignups = events?.filter(e => e.event_type === 'signup').length || 0;
      const signupRate = totalViews > 0 ? (totalSignups / totalViews) * 100 : 0;

      setStats({
        totalViews,
        totalSignups,
        signupRate: Math.round(signupRate * 10) / 10,
        hasPages: true,
        hasResources,
        hasFirstSignup: (totalSignupCount || 0) > 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadRecentPages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug, published, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (pages && pages.length > 0) {
        // Get view counts for these pages
        const pageIds = pages.map(p => p.id);
        const { data: events } = await supabase
          .from('analytics_events')
          .select('page_id')
          .in('page_id', pageIds)
          .eq('event_type', 'view');

        const viewCounts = pageIds.reduce((acc, id) => {
          acc[id] = events?.filter(e => e.page_id === id).length || 0;
          return acc;
        }, {} as Record<string, number>);

        setRecentPages(pages.map(p => ({
          ...p,
          view_count: viewCounts[p.id] || 0,
        })));
      }
    } catch (error) {
      console.error('Error loading recent pages:', error);
    }
  };

  const copyPageLink = async (slug: string, pageId: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(pageId);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your shares</p>
        </div>
        <Button 
          asChild
          className="bg-gradient-ocean hover:opacity-90 transition-opacity"
        >
          <Link to="/dashboard/pages/create">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Usage Warnings */}
      {subscription && (
        <div className="space-y-4 mb-8">
          <UsageWarning
            type="pages"
            current={subscription.usage.pages}
            limit={subscription.limits.pages}
            percentage={Math.round((subscription.usage.pages / subscription.limits.pages) * 100)}
          />
          <UsageWarning
            type="signups"
            current={subscription.usage.signups_this_month}
            limit={subscription.limits.signups_per_month}
            percentage={Math.round((subscription.usage.signups_this_month / subscription.limits.signups_per_month) * 100)}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">{stats.totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signups</CardDescription>
            <CardTitle className="text-3xl">{stats.totalSignups.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signup Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.signupRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Content Based on Pages */}
      {!stats.hasPages ? (
        <>
          {/* Empty State */}
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create your first page</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Build a landing page, add resources, and start collecting emails
              </p>
              <Button
                asChild
                className="bg-gradient-ocean hover:opacity-90 transition-opacity"
              >
                <Link to="/dashboard/pages/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Quick Share Widget */}
          {recentPages.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Quick Share
                </CardTitle>
                <CardDescription>Copy links to your recent pages in one click</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{page.title}</span>
                          {page.published ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Live
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {page.view_count} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPageLink(page.slug, page.id)}
                          className="min-w-[100px]"
                        >
                          {copiedId === page.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/s/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity Feed */}
            <RealtimeActivityFeed />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your shares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/dashboard/pages/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Page
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/dashboard/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resource
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/dashboard/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link to="/dashboard/pages">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Pages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Getting Started - Only show if there are incomplete steps */}
      {!(stats.hasPages && stats.hasResources && stats.hasFirstSignup) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              {stats.hasPages && stats.hasResources && !stats.hasFirstSignup
                ? "Almost there! Share your page to get your first signup"
                : "Complete these steps to start collecting signups"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {stats.hasPages ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                    1
                  </div>
                )}
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${stats.hasPages ? 'text-green-600' : ''}`}>
                    Create a landing page
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a template and customize it to match your brand
                  </p>
                  {!stats.hasPages && (
                    <Button asChild size="sm" className="mt-2" variant="outline">
                      <Link to="/dashboard/pages/create">Create Page</Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                {stats.hasResources ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                    2
                  </div>
                )}
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${stats.hasResources ? 'text-green-600' : ''}`}>
                    Add your resources
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload PDFs, guides, or any files you want to share
                  </p>
                  {!stats.hasResources && (
                    <Button asChild size="sm" className="mt-2" variant="outline">
                      <Link to="/dashboard/upload">Upload Resource</Link>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                {stats.hasFirstSignup ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                    3
                  </div>
                )}
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${stats.hasFirstSignup ? 'text-green-600' : ''}`}>
                    Get your first signup
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share your page link and start collecting email signups
                  </p>
                  {!stats.hasFirstSignup && stats.hasPages && (
                    <Button asChild size="sm" className="mt-2" variant="outline">
                      <Link to="/dashboard/pages">View Your Pages</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
