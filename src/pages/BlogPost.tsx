import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEOHead
        title={`Blog Post - ShareKit`}
        description="Read our latest blog post"
        canonical={`https://sharekit.net/blog/${slug}`}
      />

      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <Link to="/blog">
            <Button variant="ghost">Back to Blog</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This blog post doesn't exist yet or has been removed.
          </p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View All Posts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
