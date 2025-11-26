import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Settings, LayoutDashboard, FileText, Eye, BarChart3, Webhook, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import type { User } from "@supabase/supabase-js";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Resources", url: "/dashboard/resources", icon: FileText },
  { title: "Pages", url: "/dashboard/pages", icon: Eye },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Webhooks", url: "/dashboard/webhooks", icon: Webhook },
  { title: "Teams", url: "/dashboard/teams", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { subscription, getPlanName } = useSubscription();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });
    const subscription = data.subscription;

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" />
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
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
        </header>

        {/* Sidebar */}
        <Sidebar className="pt-16">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/dashboard"}
                          className="hover:bg-muted/50" 
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Upgrade Card */}
            <div className="p-4 mt-auto">
              {subscription?.plan === 'free' ? (
                <Card className="bg-gradient-ocean text-white">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-1">{getPlanName()} Plan</div>
                    <div className="text-xs opacity-90 mb-2">
                      {subscription.usage.signups_this_month} / {subscription.limits.signups_per_month} signups this month
                    </div>
                    <Progress
                      value={(subscription.usage.signups_this_month / subscription.limits.signups_per_month) * 100}
                      className="h-1.5 mb-3 bg-white/20"
                    />
                    <Button variant="secondary" size="sm" className="w-full" asChild>
                      <Link to="/pricing">
                        Upgrade to Pro
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">{getPlanName()} Plan</span>
                    </div>
                    <div className="text-xs opacity-90 mb-2">
                      {subscription?.usage.signups_this_month.toLocaleString()} / {subscription?.limits.signups_per_month.toLocaleString()} signups
                    </div>
                    <Progress
                      value={((subscription?.usage.signups_this_month || 0) / (subscription?.limits.signups_per_month || 1)) * 100}
                      className="h-1.5 bg-white/20"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 pt-16 p-8 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
