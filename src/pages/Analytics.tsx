import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, Download, TrendingUp, BarChart as BarChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { ConversionFunnel } from "@/components/ConversionFunnel";

interface AggregateStats {
  total_views: number;
  total_signups: number;
  total_downloads: number;
  total_pages: number;
}

interface PageStats {
  id: string;
  title: string;
  slug: string;
  views: number;
  signups: number;
  downloads: number;
  conversion_rate: number;
}

interface RecentActivity {
  id: string;
  event_type: string;
  page_title: string;
  created_at: string;
  metadata: any;
}

const Analytics = () => {
  const { toast } = useToast();
  const [aggregateStats, setAggregateStats] = useState<AggregateStats>({
    total_views: 0,
    total_signups: 0,
    total_downloads: 0,
    total_pages: 0,
  });
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all pages
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('id, title, slug, view_count')
        .order('view_count', { ascending: false });

      if (pagesError) throw pagesError;

      // Fetch all analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('id, event_type, page_id, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;

      // Calculate aggregate stats
      const stats = {
        total_views: 0,
        total_signups: 0,
        total_downloads: 0,
        total_pages: pages?.length || 0,
      };

      // Fetch detailed stats for each page
      const pageStatsPromises = pages?.map(async (page) => {
        const { data: pageEvents } = await supabase
          .from('analytics_events')
          .select('event_type')
          .eq('page_id', page.id);

        const views = pageEvents?.filter(e => e.event_type === 'view').length || 0;
        const signups = pageEvents?.filter(e => e.event_type === 'signup').length || 0;
        const downloads = pageEvents?.filter(e => e.event_type === 'download').length || 0;

        stats.total_views += views;
        stats.total_signups += signups;
        stats.total_downloads += downloads;

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          views,
          signups,
          downloads,
          conversion_rate: views > 0 ? (signups / views) * 100 : 0,
        };
      }) || [];

      const pageStatsData = await Promise.all(pageStatsPromises);
      setPageStats(pageStatsData.sort((a, b) => b.views - a.views));
      setAggregateStats(stats);

      // Process recent activity
      const activityWithTitles = events?.map(event => {
        const page = pages?.find(p => p.id === event.page_id);
        return {
          ...event,
          page_title: page?.title || 'Unknown Page',
        };
      }) || [];

      setRecentActivity(activityWithTitles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const overallConversionRate = aggregateStats.total_views > 0
    ? ((aggregateStats.total_signups / aggregateStats.total_views) * 100).toFixed(1)
    : '0.0';

  const chartData = pageStats.slice(0, 5).map(page => ({
    name: page.title.length > 20 ? page.title.substring(0, 20) + '...' : page.title,
    views: page.views,
    signups: page.signups,
  }));

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'signup':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-purple-500" />;
      default:
        return <BarChartIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return 'Page View';
      case 'signup':
        return 'Email Signup';
      case 'download':
        return 'Resource Download';
      default:
        return eventType;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">
          Track performance across all your landing pages
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aggregateStats.total_views}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {aggregateStats.total_pages} pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aggregateStats.total_signups}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total leads captured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Download className="w-4 h-4" />
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aggregateStats.total_downloads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Resources downloaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg. Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallConversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Views to signups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart and Funnel */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Views and signups comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="signups" fill="hsl(var(--success))" name="Signups" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <ConversionFunnel 
            views={aggregateStats.total_views}
            signups={aggregateStats.total_signups}
            downloads={aggregateStats.total_downloads}
          />
        </div>
      )}

      {/* Page Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Performance</CardTitle>
          <CardDescription>Detailed stats for each landing page</CardDescription>
        </CardHeader>
        <CardContent>
          {pageStats.length === 0 ? (
            <div className="text-center py-12">
              <BarChartIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground">
                Create pages and start sharing to see analytics
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageStats.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Link 
                          to={`/dashboard/pages/${page.id}/analytics`}
                          className="font-medium hover:underline"
                        >
                          {page.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                      <TableCell className="text-right">{page.signups}</TableCell>
                      <TableCell className="text-right">{page.downloads}</TableCell>
                      <TableCell className="text-right">
                        {page.conversion_rate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across all pages</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="shrink-0">
                    {getEventIcon(activity.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getEventLabel(activity.event_type)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.page_title}
                      {activity.metadata?.email && ` • ${activity.metadata.email}`}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Analytics */}
      {pageStats.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Advanced Analytics</h2>
            <p className="text-muted-foreground">
              Deep dive into conversion funnels, trends, and cohort analysis
            </p>
          </div>
          <AdvancedAnalytics />
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
