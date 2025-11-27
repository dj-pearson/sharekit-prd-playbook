import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, blogPostSchema } from "@/lib/structured-data";
import { ArrowLeft, ArrowRight, Clock, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string;
  category: string;
  read_time: string | null;
  published_at: string | null;
  updated_at: string | null;
  meta_keywords: string[] | null;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  category: string;
}

const BlogPost = () => {
  const { slug } = useParams();

  // Fetch the blog post from Supabase
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as BlogPostData;
    },
    enabled: !!slug,
  });

  // Fetch related posts (same category, different slug)
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.category, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, category')
        .eq('status', 'published')
        .eq('category', post?.category || '')
        .neq('slug', slug || '')
        .limit(2);

      if (error) throw error;
      return data as RelatedPost[];
    },
    enabled: !!post?.category,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading article...</span>
      </div>
    );
  }

  // Error or not found state
  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`https://sharekit.net/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featured_image || undefined}
        publishedTime={post.published_at || undefined}
        modifiedTime={post.updated_at || undefined}
        author={post.author}
        keywords={post.meta_keywords || [
          'share PDF with email capture',
          'PDF landing page',
          'email capture for PDFs',
          'lead magnet delivery',
          'resource sharing'
        ]}
        structuredData={[
          organizationSchema,
          blogPostSchema({
            title: post.title,
            excerpt: post.excerpt,
            featuredImage: post.featured_image || 'https://sharekit.net/og-default.png',
            publishedAt: post.published_at || new Date().toISOString(),
            updatedAt: post.updated_at || new Date().toISOString(),
            author: post.author
          })
        ]}
      />

      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">Home</Link>
            <Link to="/pricing" className="text-foreground/70 hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/blog" className="text-foreground/70 hover:text-foreground transition-colors">Blog</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-ocean hover:opacity-90 transition-opacity">
                Start Sharing Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="mb-8">
              <span className="text-sm font-semibold text-primary mb-4 inline-block">{post.category}</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
                </div>
                {post.read_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.read_time}</span>
                  </div>
                )}
                <span>By {post.author}</span>
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-12">
              <img
                src={post.featured_image || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200'}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content.split('\n').map(line => {
                if (line.startsWith('## ')) return `<h2 class="text-3xl font-bold mt-12 mb-4">${line.slice(3)}</h2>`;
                if (line.startsWith('### ')) return `<h3 class="text-2xl font-bold mt-8 mb-4">${line.slice(4)}</h3>`;
                if (line.startsWith('**') && line.endsWith('**')) return `<p class="font-semibold">${line.slice(2, -2)}</p>`;
                if (line.startsWith('- ')) return `<li class="ml-6">${line.slice(2)}</li>`;
                if (line.trim() === '') return '<br />';
                return `<p class="mb-4 text-foreground/90 leading-relaxed">${line}</p>`;
              }).join('') }} />
            </div>

            {/* CTA Box */}
            <div className="mt-12 p-8 bg-gradient-ocean text-white rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to start sharing PDFs with email capture?</h3>
              <p className="mb-6 opacity-90">
                Create beautiful landing pages in 5 minutes. No coding required.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Start Sharing Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <span className="text-xs font-semibold text-primary mb-2 inline-block">{relatedPost.category}</span>
                          <h4 className="text-lg font-bold">{relatedPost.title}</h4>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-muted-foreground">Share what matters</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/dmca" className="hover:text-foreground transition-colors">DMCA Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 ShareKit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
