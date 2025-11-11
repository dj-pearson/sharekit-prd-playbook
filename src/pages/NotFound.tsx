import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-2xl">
        {/* ShareKit Logo */}
        <Link to="/" className="flex items-center justify-center mb-8 hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>

        <Card className="border-2 shadow-large text-center">
          <CardContent className="py-16">
            {/* 404 Illustration */}
            <div className="w-24 h-24 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-primary" />
            </div>

            {/* Error Message */}
            <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-gradient-ocean hover:opacity-90"
                size="lg"
              >
                <Link to="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <a>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </a>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Or try one of these popular pages:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">Home</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/pricing">Pricing</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard/pages">My Pages</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard/settings">Settings</Link>
                </Button>
              </div>
            </div>

            {/* Debug Info (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-xs text-slate-500">
                Attempted path: <code className="bg-slate-100 px-2 py-1 rounded">{location.pathname}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Help */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help?{" "}
          <a href="mailto:support@sharekit.com" className="underline hover:text-foreground">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
