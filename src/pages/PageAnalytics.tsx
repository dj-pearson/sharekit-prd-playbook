import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Mail, TrendingUp, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface PageData {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
}

interface EmailCapture {
  id: string;
  email: string;
  full_name: string | null;
  captured_at: string;
}

interface AnalyticsStats {
  total_views: number;
  total_signups: number;
  total_downloads: number;
}

const PageAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState<PageData | null>(null);
  const [emailCaptures, setEmailCaptures] = useState<EmailCapture[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    total_views: 0,
    total_signups: 0,
    total_downloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPageAnalytics();
    }
  }, [id]);

  const fetchPageAnalytics = async () => {
    try {
      // Fetch page details
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id, title, slug, view_count, is_published, created_at')
        .eq('id', id)
        .single();

      if (pageError) throw pageError;
      setPage(pageData);

      // Fetch email captures
      const { data: captures, error: capturesError } = await supabase
        .from('email_captures')
        .select('id, email, full_name, captured_at')
        .eq('page_id', id)
        .order('captured_at', { ascending: false });

      if (capturesError) throw capturesError;
      setEmailCaptures(captures || []);

      // Fetch analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('event_type')
        .eq('page_id', id);

      if (eventsError) throw eventsError;

      const analytics = events?.reduce(
        (acc, event) => {
          if (event.event_type === 'view') acc.total_views++;
          if (event.event_type === 'signup') acc.total_signups++;
          if (event.event_type === 'download') acc.total_downloads++;
          return acc;
        },
        { total_views: 0, total_signups: 0, total_downloads: 0 }
      );

      setStats(analytics || { total_views: 0, total_signups: 0, total_downloads: 0 });
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

  const copyPageLink = () => {
    if (!page) return;
    const url = `${window.location.origin}/p/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Page link copied to clipboard",
    });
  };

  const exportEmails = () => {
    const csv = [
      ['Email', 'Full Name', 'Captured At'].join(','),
      ...emailCaptures.map(capture => 
        [
          capture.email,
          capture.full_name || '',
          new Date(capture.captured_at).toLocaleString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page?.slug}-emails.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Email list downloaded as CSV",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!page) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="py-16 text-center">
              <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
              <p className="text-muted-foreground mb-6">This page doesn't exist or you don't have access to it.</p>
              <Button onClick={() => navigate('/dashboard/pages')}>
                Back to Pages
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const conversionRate = stats.total_views > 0
    ? ((stats.total_signups / stats.total_views) * 100).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
              <p className="text-muted-foreground">
                Created {new Date(page.created_at).toLocaleDateString()}
                {!page.is_published && (
                  <span className="ml-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    Unpublished
                  </span>
                )}
              </p>
            </div>
            <Button onClick={copyPageLink} variant="outline">
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_views}</div>
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
              <div className="text-3xl font-bold">{stats.total_signups}</div>
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
              <div className="text-3xl font-bold">{stats.total_downloads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Email Captures Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email Captures</CardTitle>
                <CardDescription>
                  {emailCaptures.length} {emailCaptures.length === 1 ? 'email' : 'emails'} collected
                </CardDescription>
              </div>
              {emailCaptures.length > 0 && (
                <Button onClick={exportEmails} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {emailCaptures.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No emails yet</h3>
                <p className="text-muted-foreground">
                  Share your page link to start collecting emails
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Captured At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailCaptures.map((capture) => (
                      <TableRow key={capture.id}>
                        <TableCell className="font-medium">{capture.email}</TableCell>
                        <TableCell>{capture.full_name || '-'}</TableCell>
                        <TableCell>
                          {new Date(capture.captured_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PageAnalytics;
