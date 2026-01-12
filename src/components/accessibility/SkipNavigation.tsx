import { useCallback } from 'react';

interface SkipLink {
  href: string;
  label: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
];

interface SkipNavigationProps {
  links?: SkipLink[];
}

export function SkipNavigation({ links = defaultLinks }: SkipNavigationProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      // Set tabindex if not already focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      (target as HTMLElement).focus();
      // Scroll to element
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="skip-navigation">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onClick={(e) => handleClick(e, link.href)}
          className="skip-link"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default SkipNavigation;
