import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Settings, LayoutDashboard, FileText, Eye, BarChart3, Webhook, Users, Crown, Bell, Plus, UserPlus, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions, PERMISSIONS } from "@/hooks/usePermissions";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { User } from "@supabase/supabase-js";

interface Notification {
  id: string;
  type: 'signup' | 'milestone';
  message: string;
  page_title?: string;
  created_at: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation items with permission requirements
const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: null },
  { title: "Resources", url: "/dashboard/resources", icon: FileText, permission: PERMISSIONS.RESOURCES_VIEW_OWN },
  { title: "Pages", url: "/dashboard/pages", icon: Eye, permission: PERMISSIONS.PAGES_VIEW_OWN },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, permission: PERMISSIONS.ANALYTICS_VIEW_OWN },
  { title: "Webhooks", url: "/dashboard/webhooks", icon: Webhook, permission: PERMISSIONS.WEBHOOKS_VIEW },
  { title: "Teams", url: "/dashboard/teams", icon: Users, permission: PERMISSIONS.TEAMS_VIEW },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
] as const;

// Route to breadcrumb label mapping
const routeLabels: Record<string, string> = {
  "dashboard": "Dashboard",
  "resources": "Resources",
  "pages": "Pages",
  "analytics": "Analytics",
  "webhooks": "Webhooks",
  "teams": "Teams",
  "settings": "Settings",
  "create": "Create",
  "edit": "Edit",
  "upload": "Upload",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { subscription, getPlanName } = useSubscription();

  // Layer 1 & 2: Authentication and basic authorization
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth({
    requireAuth: true,
    showToast: true,
  });

  // Layer 2: Permissions for conditional UI rendering
  const { can, role, isLoading: permissionsLoading } = usePermissions();

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];

    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ label, path: currentPath });
    }

    return crumbs;
  }, [location.pathname]);

  // Load notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadNotifications(user.id);
    }
  }, [isAuthenticated, user?.id]);

  const loadNotifications = async (userId: string) => {
    try {
      // Get recent signups from user's pages
      const { data: pages } = await supabase
        .from('pages')
        .select('id, title')
        .eq('user_id', userId);

      if (!pages || pages.length === 0) return;

      const pageIds = pages.map(p => p.id);
      const pageMap = new Map(pages.map(p => [p.id, p.title]));

      // Get recent email captures (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recentSignups } = await supabase
        .from('email_captures')
        .select('id, page_id, email, captured_at')
        .in('page_id', pageIds)
        .gte('captured_at', yesterday.toISOString())
        .order('captured_at', { ascending: false })
        .limit(5);

      if (recentSignups) {
        const notifs: Notification[] = recentSignups.map(signup => ({
          id: signup.id,
          type: 'signup' as const,
          message: `New signup on "${pageMap.get(signup.page_id) || 'your page'}"`,
          page_title: pageMap.get(signup.page_id),
          created_at: signup.captured_at,
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading state while checking authentication
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (redirect handled by useAuth)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle" role="document">
        {/* Skip navigation target */}
        <a id="main-content" tabIndex={-1} className="sr-only">Main content start</a>

        {/* Header */}
        <header
          className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          role="banner"
          aria-label="Dashboard header"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" />
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* New Page Button */}
              <Button
                asChild
                size="sm"
                className="bg-gradient-ocean hover:opacity-90 transition-opacity hidden sm:flex"
              >
                <Link to="/dashboard/pages/create">
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  New Page
                </Link>
              </Button>
              <Button
                asChild
                size="icon"
                className="bg-gradient-ocean hover:opacity-90 transition-opacity sm:hidden h-10 w-10"
              >
                <Link to="/dashboard/pages/create" aria-label="Create new page">
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 sm:h-8 sm:w-8"
                    onClick={clearNotifications}
                    aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
                  >
                    <Bell className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex items-start gap-3 py-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0" aria-hidden="true">
                          <UserPlus className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="justify-center">
                        <Link to="/dashboard/analytics" className="text-sm text-primary">
                          View all activity
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                Sign Out
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="sm:hidden h-10 w-10"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </Button>
              <div
                className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center text-white text-sm font-medium"
                role="img"
                aria-label={`User avatar for ${user?.email}`}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <Sidebar className="pt-16" aria-label="Dashboard navigation">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems
                    .filter((item) => !item.permission || can(item.permission))
                    .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/dashboard"}
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {/* Admin link - only shown to admins */}
                  {can(PERMISSIONS.ADMIN_ACCESS) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/admin/dashboard"
                          className="hover:bg-muted/50"
                          activeClassName="bg-muted text-primary font-medium"
                        >
                          <Shield className="h-4 w-4" aria-hidden="true" />
                          <span>Admin Panel</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Upgrade Card */}
            <div className="p-4 mt-auto">
              {subscription?.plan === 'free' ? (
                <Card className="bg-gradient-ocean text-white">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-1">{getPlanName()} Plan</div>
                    <div className="text-xs opacity-90 mb-2" id="free-plan-usage">
                      {subscription.usage.signups_this_month} / {subscription.limits.signups_per_month} signups this month
                    </div>
                    <Progress
                      value={(subscription.usage.signups_this_month / subscription.limits.signups_per_month) * 100}
                      className="h-1.5 mb-3 bg-white/20"
                      aria-label="Monthly signup usage"
                      aria-describedby="free-plan-usage"
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
                      <Crown className="w-4 h-4" aria-hidden="true" />
                      <span className="text-sm font-medium">{getPlanName()} Plan</span>
                    </div>
                    <div className="text-xs opacity-90 mb-2" id="pro-plan-usage">
                      {subscription?.usage.signups_this_month.toLocaleString()} / {subscription?.limits.signups_per_month.toLocaleString()} signups
                    </div>
                    <Progress
                      value={((subscription?.usage.signups_this_month || 0) / (subscription?.limits.signups_per_month || 1)) * 100}
                      className="h-1.5 bg-white/20"
                      aria-label="Monthly signup usage"
                      aria-describedby="pro-plan-usage"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 pt-16 p-8 overflow-auto" role="main" aria-label="Dashboard content">
          <div className="container mx-auto max-w-7xl">
            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 1 && (
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/dashboard" className="flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" />
                        <span className="sr-only">Home</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.path} className="contents">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.path}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </span>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
