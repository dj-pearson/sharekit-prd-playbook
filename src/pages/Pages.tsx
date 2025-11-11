import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage your landing pages and share links
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-ocean hover:opacity-90 transition-opacity"
        >
          <Link to="/dashboard/pages/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Link>
        </Button>
      </div>

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
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
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
  );
};

export default Pages;
