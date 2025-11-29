import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Logo } from "@/components/Logo";

const Blog = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEOHead
        title="Blog - ShareKit"
        description="Latest updates, tips, and insights from ShareKit"
        canonical="https://sharekit.net/blog"
      />

      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link to="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Coming Soon</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We're working on creating valuable content for you. Check back soon!
          </p>
          <Link to="/">
            <Button className="bg-gradient-ocean hover:opacity-90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
