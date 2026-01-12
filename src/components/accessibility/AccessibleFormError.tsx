import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLiveAnnouncer } from './LiveAnnouncer';

interface AccessibleFormErrorProps {
  id: string;
  message: string;
  announceError?: boolean;
}

export function AccessibleFormError({
  id,
  message,
  announceError = true,
}: AccessibleFormErrorProps) {
  const { announceAssertive } = useLiveAnnouncer();
  const hasAnnounced = useRef(false);

  useEffect(() => {
    if (message && announceError && !hasAnnounced.current) {
      announceAssertive(`Error: ${message}`);
      hasAnnounced.current = true;
    }

    // Reset when message changes
    if (!message) {
      hasAnnounced.current = false;
    }
  }, [message, announceError, announceAssertive]);

  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-atomic="true"
      className="flex items-start gap-2 mt-2 text-sm text-destructive"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
}

export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors:',
}: FormErrorSummaryProps) {
  const { announceAssertive } = useLiveAnnouncer();
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorEntries = Object.entries(errors).filter(([, message]) => message);

  useEffect(() => {
    if (errorEntries.length > 0) {
      // Focus the error summary
      summaryRef.current?.focus();
      // Announce the error count
      announceAssertive(
        `Form has ${errorEntries.length} error${errorEntries.length > 1 ? 's' : ''}. ${title}`
      );
    }
  }, [errorEntries.length, title, announceAssertive]);

  if (errorEntries.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      role="alert"
      aria-labelledby="error-summary-title"
      tabIndex={-1}
      className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
    >
      <h2
        id="error-summary-title"
        className="font-semibold text-destructive mb-2 flex items-center gap-2"
      >
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        {title}
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              className="text-destructive hover:underline focus:underline"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(field);
                if (element) {
                  element.focus();
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AccessibleFormError;
