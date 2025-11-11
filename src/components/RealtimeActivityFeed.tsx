import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Download, Eye, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ActivityEvent {
  id: string;
  type: "signup" | "download" | "view";
  email?: string;
  full_name?: string | null;
  page_title?: string;
  resource_title?: string;
  created_at: string;
}

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
    subscribeToActivity();

    return () => {
      // Cleanup subscription
      supabase.channel('activity-feed').unsubscribe();
    };
  }, []);

  const loadRecentActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's pages
      const { data: userPages } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id);

      if (!userPages || userPages.length === 0) {
        setIsLoading(false);
        return;
      }

      const pageIds = userPages.map(p => p.id);

      // Get recent signups
      const { data: signups } = await supabase
        .from('email_captures')
        .select(`
          id,
          email,
          full_name,
          captured_at,
          pages (
            title
          )
        `)
        .in('page_id', pageIds)
        .order('captured_at', { ascending: false })
        .limit(10);

      // Get recent analytics events
      const { data: events } = await supabase
        .from('analytics_events')
        .select(`
          id,
          event_type,
          created_at,
          pages (
            title
          ),
          resources (
            title
          )
        `)
        .in('page_id', pageIds)
        .in('event_type', ['download', 'view'])
        .order('created_at', { ascending: false })
        .limit(20);

      // Combine and sort all activities
      const allActivities: ActivityEvent[] = [
        ...(signups || []).map(s => ({
          id: s.id,
          type: 'signup' as const,
          email: s.email,
          full_name: s.full_name,
          page_title: (s.pages as any)?.title,
          created_at: s.captured_at,
        })),
        ...(events || []).map(e => ({
          id: e.id,
          type: e.event_type as 'download' | 'view',
          page_title: (e.pages as any)?.title,
          resource_title: (e.resources as any)?.title,
          created_at: e.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(allActivities.slice(0, 15));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToActivity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to new email captures
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_captures',
        },
        async (payload: any) => {
          // Check if this belongs to user's page
          const { data: page } = await supabase
            .from('pages')
            .select('title, user_id')
            .eq('id', payload.new.page_id)
            .single();

          if (page && page.user_id === user.id) {
            const newActivity: ActivityEvent = {
              id: payload.new.id,
              type: 'signup',
              email: payload.new.email,
              full_name: payload.new.full_name,
              page_title: page.title,
              created_at: payload.new.captured_at,
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 15));

            // Show toast notification for new signup
            toast.success('🎉 New Signup!', {
              description: `${payload.new.full_name || payload.new.email} just signed up for ${page.title}`,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
        },
        async (payload: any) => {
          if (payload.new.event_type === 'download' || payload.new.event_type === 'view') {
            // Check if this belongs to user's page
            const { data: page } = await supabase
              .from('pages')
              .select('title, user_id')
              .eq('id', payload.new.page_id)
              .single();

            if (page && page.user_id === user.id) {
              let resourceTitle = undefined;
              if (payload.new.resource_id) {
                const { data: resource } = await supabase
                  .from('resources')
                  .select('title')
                  .eq('id', payload.new.resource_id)
                  .single();
                resourceTitle = resource?.title;
              }

              const newActivity: ActivityEvent = {
                id: payload.new.id,
                type: payload.new.event_type,
                page_title: page.title,
                resource_title: resourceTitle,
                created_at: payload.new.created_at,
              };

              setActivities(prev => [newActivity, ...prev].slice(0, 15));

              // Show toast notification for downloads
              if (payload.new.event_type === 'download') {
                toast.success('📥 New Download!', {
                  description: `Someone downloaded ${resourceTitle || 'a resource'} from ${page.title}`,
                  duration: 4000,
                });
              }
            }
          }
        }
      )
      .subscribe();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <Mail className="w-4 h-4 text-cyan-600" />;
      case 'download':
        return <Download className="w-4 h-4 text-emerald-600" />;
      case 'view':
        return <Eye className="w-4 h-4 text-slate-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100';
      case 'download':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
      case 'view':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getActivityText = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'signup':
        return (
          <div>
            <span className="font-medium">
              {activity.full_name || activity.email?.split('@')[0] || 'Someone'}
            </span>
            {' '}signed up for{' '}
            <span className="text-slate-600">{activity.page_title}</span>
          </div>
        );
      case 'download':
        return (
          <div>
            Someone downloaded{' '}
            <span className="text-slate-600">
              {activity.resource_title || 'a resource'}
            </span>
          </div>
        );
      case 'view':
        return (
          <div>
            Someone viewed{' '}
            <span className="text-slate-600">{activity.page_title}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live updates from your pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live updates from your pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-600">
              No activity yet. Share your pages to see live updates here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live updates from your pages</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-top-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-gradient-ocean text-white">
                    {getIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm mb-1">{getActivityText(activity)}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getBadgeColor(activity.type)}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
