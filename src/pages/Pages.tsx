import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Edit, Trash2, Copy, ExternalLink, BarChart, Sparkles, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt, UsageWarning } from "@/components/UpgradePrompt";
import { PagesListSkeleton } from "@/components/LoadingSkeletons";

interface Page {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  template: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
}

const Pages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const { toast } = useToast();
  const { subscription, canCreatePage, getPlanName } = useSubscription();

  // Filter pages based on search query and status
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = searchQuery === "" ||
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (page.description && page.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "published" && page.is_published) ||
        (statusFilter === "draft" && !page.is_published);

      return matchesSearch && matchesStatus;
    });
  }, [pages, searchQuery, statusFilter]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Page ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });

      fetchPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive",
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page deleted successfully",
      });

      fetchPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Page URL has been copied to clipboard",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Pages</h1>
              <p className="text-muted-foreground mt-1">
                Manage your landing pages and share links
              </p>
            </div>
          </div>
          <PagesListSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-muted-foreground mt-1">
              Manage your landing pages and share links
              {subscription && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                  {getPlanName()} Plan - {subscription.usage.pages}/{subscription.limits.pages === Infinity ? '∞' : subscription.limits.pages} pages
                </span>
              )}
            </p>
          </div>
          {canCreatePage() ? (
            <Button
              asChild
              className="bg-gradient-ocean hover:opacity-90 transition-opacity"
            >
              <Link to="/dashboard/pages/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Link>
            </Button>
          ) : (
            <Button
              disabled
              className="bg-gradient-ocean opacity-50 cursor-not-allowed"
              title="Page limit reached - Upgrade to Pro"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Page (Limit Reached)
            </Button>
          )}
        </div>

        {/* Usage Warning */}
        {subscription && subscription.usage.pages >= subscription.limits.pages && (
          <UpgradePrompt reason="pages" currentPlan={getPlanName()} variant="alert" />
        )}

        {/* Search and Filter */}
        {pages.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pages by title, slug, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: "all" | "published" | "draft") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {pages.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first landing page to start sharing resources
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
        ) : filteredPages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No pages found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? `No pages match "${searchQuery}"`
                  : `No ${statusFilter === "published" ? "published" : "draft"} pages`}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{page.title}</CardTitle>
                        <Badge variant={page.is_published ? "default" : "secondary"}>
                          {page.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      {page.description && (
                        <CardDescription className="mt-1">
                          {page.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>/{page.slug}</span>
                        <span>•</span>
                        <span>{page.view_count} views</span>
                        <span>•</span>
                        <span>{formatDate(page.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {page.is_published && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(page.slug)}
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View page"
                          >
                            <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View analytics"
                      >
                        <Link to={`/dashboard/pages/${page.id}/analytics`}>
                          <BarChart className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Smart page builder"
                      >
                        <Link to={`/dashboard/pages/builder/${page.id}`}>
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Edit page"
                      >
                        <Link to={`/dashboard/pages/${page.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePage(page.id)}
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={page.is_published ? "outline" : "default"}
                      size="sm"
                      onClick={() => togglePublished(page.id, page.is_published)}
                      className={!page.is_published ? "bg-gradient-ocean" : ""}
                    >
                      {page.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Pages;
