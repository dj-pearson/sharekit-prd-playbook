import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";

interface PageData {
  id: string;
  title: string;
  description: string | null;
  template: string;
  view_count: number;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
}

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      // Fetch page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id, title, description, template, view_count')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError || !pageData) {
        setNotFound(true);
        return;
      }

      setPage(pageData);

      // Increment view count
      await supabase
        .from('pages')
        .update({ view_count: pageData.view_count + 1 })
        .eq('id', pageData.id);

      // Track view analytics
      await supabase
        .from('analytics_events')
        .insert({
          page_id: pageData.id,
          event_type: 'view',
        });

      // Fetch resources for this page
      const { data: pageResources, error: resourceError } = await supabase
        .from('page_resources')
        .select(`
          resource_id,
          display_order,
          resources (
            id,
            title,
            description,
            file_url,
            file_name
          )
        `)
        .eq('page_id', pageData.id)
        .order('display_order', { ascending: true });

      if (resourceError) throw resourceError;

      const resourcesList = pageResources
        .map((pr: any) => pr.resources)
        .filter(Boolean);

      setResources(resourcesList);
    } catch (error) {
      console.error('Error fetching page:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (!page) return;

    // Track download analytics
    await supabase
      .from('analytics_events')
      .insert({
        page_id: page.id,
        event_type: 'download',
        resource_id: resource.id,
      });

    // Open download in new tab
    window.open(resource.file_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-16">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This page doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const templateClasses = {
    minimal: "bg-background",
    modern: "bg-gradient-subtle",
    professional: "bg-gradient-to-br from-background to-accent/5",
  };

  return (
    <div className={`min-h-screen ${templateClasses[page.template as keyof typeof templateClasses] || templateClasses.minimal}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-ocean flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ShareKit</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
              {page.description && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {page.description}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Resources Preview */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">What You'll Get:</h2>
                {resources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-large transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-ocean/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                          {hasSubmitted && (
                            <Button
                              size="sm"
                              className="mt-3 bg-gradient-ocean hover:opacity-90"
                              onClick={() => handleDownload(resource)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Email Capture or Success */}
              <div className="md:sticky md:top-8">
                {hasSubmitted ? (
                  <Card className="border-2 shadow-large bg-success/5 border-success">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-success" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">You're All Set!</h3>
                      <p className="text-muted-foreground mb-6">
                        Click the download buttons to get your resources.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        We've also sent everything to your email for future reference.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <EmailCaptureForm
                    pageId={page.id}
                    pageTitle={page.title}
                    resources={resources}
                    onSuccess={() => setHasSubmitted(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <Link to="/" className="underline hover:text-foreground">
              ShareKit
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
