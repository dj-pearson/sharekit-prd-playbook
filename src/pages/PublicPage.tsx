import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, Download, CheckCircle, Users, TrendingUp, Star, Crown, Zap, Heart, ExternalLink, Twitter, Linkedin, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { Logo } from "@/components/Logo";

interface PageData {
  id: string;
  title: string;
  description: string | null;
  template: string;
  view_count: number;
  signup_count?: number;
  download_count?: number;
  creator_name?: string;
  creator_id?: string;
  creator_plan?: 'free' | 'pro' | 'business';
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
      // Fetch page with creator info and subscription plan
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select(`
          id,
          title,
          description,
          template,
          view_count,
          user_id,
          profiles!pages_user_id_fkey (
            full_name,
            subscription_plan
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError || !pageData) {
        setNotFound(true);
        return;
      }

      // Get signup count
      const { count: signupCount } = await supabase
        .from('email_captures')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', pageData.id);

      // Get download count
      const { count: downloadCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', pageData.id)
        .eq('event_type', 'download');

      setPage({
        id: pageData.id,
        title: pageData.title,
        description: pageData.description,
        template: pageData.template,
        view_count: pageData.view_count,
        signup_count: signupCount || 0,
        download_count: downloadCount || 0,
        creator_name: (pageData.profiles as any)?.full_name || 'Creator',
        creator_id: pageData.user_id,
        creator_plan: (pageData.profiles as any)?.subscription_plan || 'free',
      });

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

  const shareToTwitter = () => {
    const text = `I just got "${page.title}" - check it out!`;
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareToLinkedIn = () => {
    const url = window.location.href;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=550'
    );
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show success toast
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Link copied!',
        description: 'Share link copied to clipboard 🚀',
      },
    });
    window.dispatchEvent(event);
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

  const getMilestoneBadge = (count: number) => {
    if (count >= 500) {
      return { icon: Zap, text: "🚀 Viral", color: "text-purple-600 bg-purple-50 border-purple-200" };
    } else if (count >= 100) {
      return { icon: Crown, text: "👑 Top Resource", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
    } else if (count >= 50) {
      return { icon: Star, text: "⭐ Popular", color: "text-orange-600 bg-orange-50 border-orange-200" };
    } else if (count >= 10) {
      return { icon: TrendingUp, text: "🔥 Trending", color: "text-red-600 bg-red-50 border-red-200" };
    }
    return null;
  };

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
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
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

              {/* Social Proof */}
              {page.signup_count !== undefined && page.signup_count > 0 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <div className="flex items-center gap-2 text-slate-700 bg-white px-4 py-2 rounded-full border shadow-sm">
                    <Users className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm">
                      Join <strong className="text-slate-900">{page.signup_count}</strong> {page.signup_count === 1 ? 'person' : 'people'} who got this
                    </span>
                  </div>

                  {getMilestoneBadge(page.signup_count) && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getMilestoneBadge(page.signup_count)?.color}`}>
                      {getMilestoneBadge(page.signup_count)?.text}
                    </div>
                  )}
                </div>
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
                  <div className="space-y-4">
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

                    {/* Social Share CTA */}
                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
                          Found this helpful?
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 text-center">
                          Share it with someone who'd benefit from it
                        </p>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start bg-white hover:bg-slate-50"
                            onClick={shareToTwitter}
                          >
                            <Twitter className="w-4 h-4 mr-2 text-sky-500" />
                            Share on Twitter
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start bg-white hover:bg-slate-50"
                            onClick={shareToLinkedIn}
                          >
                            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                            Share on LinkedIn
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start bg-white hover:bg-slate-50"
                            onClick={copyShareLink}
                          >
                            <Copy className="w-4 h-4 mr-2 text-slate-600" />
                            Copy Link
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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

      {/* Footer with Viral Attribution */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4">
          {/* Viral Attribution - Only show for Free plan (Pro+ removes branding) */}
          {page.creator_plan === 'free' && (
            <div className="py-8 text-center border-b">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-slate-600 mb-4">
                <span>Shared with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>by</span>
                <span className="font-medium text-slate-900">{page.creator_name}</span>
                <span>using</span>
                <a
                  href="/?ref=page-footer"
                  className="font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 transition-colors"
                >
                  ShareKit
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* CTA for viral growth */}
              <div className="mt-4">
                <a
                  href="/?ref=page-footer-cta"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 transition-colors group"
                >
                  <Sparkles className="w-4 h-4 text-cyan-500 group-hover:text-cyan-600" />
                  <span className="underline">Create your own share page in 3 minutes →</span>
                </a>
              </div>
            </div>
          )}

          {/* Legal links */}
          <div className="py-6 text-center text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            {" · "}
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;
