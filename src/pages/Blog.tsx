import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema } from "@/lib/structured-data";
import { ArrowRight } from "lucide-react";

const Blog = () => {
  // This will be replaced with actual data from Supabase
  const blogPosts = [
    {
      id: 1,
      slug: "how-to-share-pdf-with-email-capture",
      title: "How to Share a PDF with Email Capture (5-Minute Guide)",
      excerpt: "Learn how to create professional landing pages that capture emails before delivering your PDF resources. Step-by-step guide with ShareKit.",
      publishedAt: "2025-01-15",
      author: "Dan Pearson",
      category: "How-To Guides",
      readTime: "7 min read",
      featuredImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800"
    },
    {
      id: 2,
      slug: "simple-way-to-deliver-digital-resources",
      title: "The Simple Way to Deliver Digital Resources to Clients",
      excerpt: "Compare 3 methods for delivering digital resources: Google Drive, manual email, and automated platforms like ShareKit. Find the best approach for your business.",
      publishedAt: "2025-01-12",
      author: "Dan Pearson",
      category: "How-To Guides",
      readTime: "6 min read",
      featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
    },
    {
      id: 3,
      slug: "convertkit-alternatives-for-lead-magnet-delivery",
      title: "ConvertKit Alternatives for Simple Lead Magnet Delivery",
      excerpt: "If you're only using ConvertKit for lead magnet delivery, you're overpaying. Discover simpler, more affordable alternatives that focus on what you actually need.",
      publishedAt: "2025-01-10",
      author: "Dan Pearson",
      category: "Comparisons",
      readTime: "8 min read",
      featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="ShareKit Blog - Resources for Creators & Coaches"
        description="Learn how to share digital resources, deliver lead magnets, and grow your audience. Expert guides for coaches, consultants, and course creators."
        canonical="https://sharekit.net/blog"
        keywords={[
          'resource delivery tips',
          'lead magnet strategies',
          'email capture best practices',
          'creator tools guide',
          'ConvertKit alternatives'
        ]}
        structuredData={[organizationSchema]}
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
            <Link to="/blog" className="text-foreground font-semibold">Blog</Link>
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

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">ShareKit Blog</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Learn how to share your expertise, deliver digital resources, and grow your creator business.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold text-primary">{post.category}</span>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          Read more <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-ocean text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start sharing?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Put what you've learned into action. Create beautiful resource pages in minutes.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Sharing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

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

export default Blog;
