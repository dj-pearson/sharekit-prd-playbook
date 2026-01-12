import { ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Visually hidden component that hides content visually but keeps it accessible to screen readers.
 * Use this for providing additional context to assistive technologies.
 */
export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Hook to generate accessible names for icon-only buttons
 */
export function useAccessibleLabel(label: string) {
  return {
    'aria-label': label,
  };
}

export default VisuallyHidden;
