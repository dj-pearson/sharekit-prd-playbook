import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  LifeBuoy,
  FileEdit,
  Megaphone,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Activity,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { label: 'Monitoring', path: '/admin/monitoring', icon: Activity, permission: 'dashboard.view' },
  { label: 'Users', path: '/admin/users', icon: Users, permission: 'users.view' },
  { label: 'Content', path: '/admin/content', icon: FileText, permission: 'content.view' },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard, permission: 'subscriptions.view' },
  { label: 'Support', path: '/admin/support', icon: LifeBuoy, permission: 'support.view' },
  { label: 'CMS', path: '/admin/cms', icon: FileEdit, permission: 'cms.view' },
  { label: 'Marketing', path: '/admin/marketing', icon: Megaphone, permission: 'cms.view' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, permission: 'dashboard.view' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, hasPermission, isLoading } = useAdmin(true);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  // Reusable navigation component
  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">ShareKit</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
                             location.pathname.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-3 h-auto py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {adminUser.role.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500 capitalize">
                  {adminUser.role.replace('_', ' ')}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              Go to User Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <NavigationContent />
      </aside>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <NavigationContent onItemClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 hidden sm:block">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
