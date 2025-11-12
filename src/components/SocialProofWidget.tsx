import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Download, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "signup" | "download";
  name: string;
  timeAgo: string;
}

interface SocialProofWidgetProps {
  pageId: string;
}

export function SocialProofWidget({ pageId }: SocialProofWidgetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadRecentActivity();
    subscribeToActivity();

    return () => {
      supabase.channel('social-proof').unsubscribe();
    };
  }, [pageId]);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      showNextNotification();
    }
  }, [notifications, currentNotification]);

  const loadRecentActivity = async () => {
    try {
      // Get recent signups
      const { data: signups } = await supabase
        .from('email_captures')
        .select('id, full_name, email, captured_at')
        .eq('page_id', pageId)
        .order('captured_at', { ascending: false })
        .limit(5);

      const recentNotifications: Notification[] = (signups || []).map(s => ({
        id: s.id,
        type: 'signup' as const,
        name: s.full_name || s.email.split('@')[0],
        timeAgo: formatDistanceToNow(new Date(s.captured_at), { addSuffix: true }),
      }));

      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Error loading social proof:', error);
    }
  };

  const subscribeToActivity = () => {
    const channel = supabase
      .channel('social-proof')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_captures',
          filter: `page_id=eq.${pageId}`,
        },
        (payload: any) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: 'signup',
            name: payload.new.full_name || payload.new.email.split('@')[0],
            timeAgo: 'just now',
          };

          setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        }
      )
      .subscribe();
  };

  const showNextNotification = () => {
    if (notifications.length === 0) return;

    const next = notifications[Math.floor(Math.random() * Math.min(3, notifications.length))];
    setCurrentNotification(next);
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentNotification(null);
      }, 300);
    }, 5000);

    // Show next notification after 15-25 seconds
    setTimeout(() => {
      showNextNotification();
    }, 15000 + Math.random() * 10000);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  };

  if (!currentNotification) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 p-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-bottom-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-gradient-ocean text-white">
              {currentNotification.type === 'signup' ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">
              <span className="font-semibold">{currentNotification.name}</span>{' '}
              {currentNotification.type === 'signup'
                ? 'just signed up'
                : 'downloaded a resource'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentNotification.timeAgo}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-gradient-ocean animate-progress"
            style={{ animation: 'progress 5s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
