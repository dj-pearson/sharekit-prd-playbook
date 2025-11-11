import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Users, Eye, FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { RealtimeActivityFeed } from "@/components/RealtimeActivityFeed";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalViews: number;
  totalSignups: number;
  signupRate: number;
  hasPages: boolean;
}

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalSignups: 0,
    signupRate: 0,
    hasPages: false,
  });

  useEffect(() => {
    checkOnboarding();
    loadDashboardStats();
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

      // Get user's pages
      const { data: pages } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id);

      if (!pages || pages.length === 0) {
        setStats({ ...stats, hasPages: false });
        return;
      }

      const pageIds = pages.map(p => p.id);

      // Get analytics events from last 30 days
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('page_id', pageIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
      const totalSignups = events?.filter(e => e.event_type === 'signup').length || 0;
      const signupRate = totalViews > 0 ? (totalSignups / totalViews) * 100 : 0;

      setStats({
        totalViews,
        totalSignups,
        signupRate: Math.round(signupRate * 10) / 10,
        hasPages: true,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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
      )}

      {/* Getting Started */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick steps to start sharing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                1
              </div>
              <div>
                <div className="font-medium mb-1">Create a landing page</div>
                <p className="text-sm text-muted-foreground">
                  Choose a template and customize it to match your brand
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                2
              </div>
              <div>
                <div className="font-medium mb-1">Add your resources</div>
                <p className="text-sm text-muted-foreground">
                  Upload PDFs, guides, or any files you want to share
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                3
              </div>
              <div>
                <div className="font-medium mb-1">Publish and share</div>
                <p className="text-sm text-muted-foreground">
                  Get your unique link and start collecting email signups
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
