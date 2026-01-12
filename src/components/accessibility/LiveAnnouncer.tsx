import { createContext, useContext, useCallback, useState, useRef, ReactNode, useEffect } from 'react';

type AnnouncePriority = 'polite' | 'assertive';

interface Announcement {
  id: number;
  message: string;
  priority: AnnouncePriority;
}

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: AnnouncePriority) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | undefined>(undefined);

let announcementId = 0;

export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeAnnouncements, setPoliteAnnouncements] = useState<Announcement[]>([]);
  const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<Announcement[]>([]);

  const politeTimeoutRef = useRef<NodeJS.Timeout>();
  const assertiveTimeoutRef = useRef<NodeJS.Timeout>();

  const clearAnnouncement = useCallback((id: number, priority: AnnouncePriority) => {
    if (priority === 'polite') {
      setPoliteAnnouncements(prev => prev.filter(a => a.id !== id));
    } else {
      setAssertiveAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  }, []);

  const announce = useCallback((message: string, priority: AnnouncePriority = 'polite') => {
    if (!message.trim()) return;

    const id = ++announcementId;
    const announcement: Announcement = { id, message, priority };

    if (priority === 'polite') {
      // Clear any pending timeout
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }

      setPoliteAnnouncements(prev => [...prev, announcement]);

      // Auto-clear after announcement is read
      politeTimeoutRef.current = setTimeout(() => {
        clearAnnouncement(id, 'polite');
      }, 3000);
    } else {
      // Clear any pending timeout
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }

      setAssertiveAnnouncements(prev => [...prev, announcement]);

      // Auto-clear after announcement is read
      assertiveTimeoutRef.current = setTimeout(() => {
        clearAnnouncement(id, 'assertive');
      }, 3000);
    }
  }, [clearAnnouncement]);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
    };
  }, []);

  return (
    <LiveAnnouncerContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}

      {/* Polite live region - for non-urgent updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions"
        className="sr-only"
      >
        {politeAnnouncements.map(a => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>

      {/* Assertive live region - for urgent updates */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="additions"
        className="sr-only"
      >
        {assertiveAnnouncements.map(a => (
          <span key={a.id}>{a.message}</span>
        ))}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export function useLiveAnnouncer() {
  const context = useContext(LiveAnnouncerContext);
  if (context === undefined) {
    throw new Error('useLiveAnnouncer must be used within a LiveAnnouncerProvider');
  }
  return context;
}

// Utility component for announcing route changes
export function RouteAnnouncer({ title }: { title: string }) {
  const { announcePolite } = useLiveAnnouncer();

  useEffect(() => {
    announcePolite(`Navigated to ${title}`);
  }, [title, announcePolite]);

  return null;
}

export default LiveAnnouncerProvider;
