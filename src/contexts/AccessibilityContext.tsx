import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  screenReaderAnnouncements: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  prefersReducedMotion: boolean;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  screenReaderAnnouncements: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'sharekit-accessibility-settings';

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [announcements, setAnnouncements] = useState<{ message: string; priority: 'polite' | 'assertive' }[]>([]);

  // Check system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && !settings.reducedMotion) {
        setSettings(prev => ({ ...prev, reducedMotion: true }));
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.reducedMotion]);

  // Check system preference for high contrast
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    if (mediaQuery.matches && !settings.highContrast) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }

    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSettings(prev => ({ ...prev, highContrast: true }));
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.highContrast]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion
    if (settings.reducedMotion || prefersReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
    root.classList.add(`font-size-${settings.fontSize}`);
  }, [settings, prefersReducedMotion]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (settings.screenReaderAnnouncements) {
      setAnnouncements(prev => [...prev, { message, priority }]);
      // Clear announcement after it's been read
      setTimeout(() => {
        setAnnouncements(prev => prev.slice(1));
      }, 1000);
    }
  }, [settings.screenReaderAnnouncements]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        announce,
        prefersReducedMotion: settings.reducedMotion || prefersReducedMotion,
      }}
    >
      {children}
      {/* Screen reader announcements live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map((a, i) => (
            <span key={i}>{a.message}</span>
          ))}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map((a, i) => (
            <span key={i}>{a.message}</span>
          ))}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for announcing dynamic content changes
export function useAnnounce() {
  const { announce } = useAccessibility();
  return announce;
}

// Hook to check if reduced motion is preferred
export function useReducedMotion() {
  const { prefersReducedMotion } = useAccessibility();
  return prefersReducedMotion;
}
