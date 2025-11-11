import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, LayoutDashboard, FileText, BarChart3, Settings, Plus, TrendingUp, Users, Eye, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-ocean flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">ShareKit</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/dashboard/resources">
                      <FileText className="w-4 h-4 mr-2" />
                      Resources
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/dashboard/pages">
                      <Eye className="w-4 h-4 mr-2" />
                      Pages
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </nav>

                <div className="mt-6 p-4 bg-gradient-ocean rounded-lg text-white">
                  <div className="text-sm font-medium mb-1">Free Plan</div>
                  <div className="text-xs opacity-90 mb-3">0 / 100 signups this month</div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
                <p className="text-muted-foreground">Here's what's happening with your shares</p>
              </div>
              <Button 
                asChild
                className="bg-gradient-ocean hover:opacity-90 transition-opacity"
              >
                <Link to="/dashboard/pages/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Page
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Views</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="w-4 h-4 mr-1" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Signups</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Signup Rate</CardDescription>
                  <CardTitle className="text-3xl">0%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Last 30 days
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empty State */}
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create your first page</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Build a landing page, add resources, and start collecting emails
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

            {/* Getting Started */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Quick steps to start sharing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                      1
                    </div>
                    <div>
                      <div className="font-medium mb-1">Create a landing page</div>
                      <p className="text-sm text-muted-foreground">
                        Choose a template and customize it to match your brand
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                      2
                    </div>
                    <div>
                      <div className="font-medium mb-1">Add your resources</div>
                      <p className="text-sm text-muted-foreground">
                        Upload PDFs, guides, or any files you want to share
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                      3
                    </div>
                    <div>
                      <div className="font-medium mb-1">Publish and share</div>
                      <p className="text-sm text-muted-foreground">
                        Get your unique link and start collecting email signups
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
