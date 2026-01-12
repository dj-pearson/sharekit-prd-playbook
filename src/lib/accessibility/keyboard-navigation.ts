/**
 * Keyboard Navigation Utilities for ADA Compliance
 *
 * Provides utilities for implementing accessible keyboard navigation
 * following WCAG 2.1 guidelines and WAI-ARIA best practices.
 */

/**
 * Common keyboard keys used in navigation
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
} as const;

/**
 * Focusable element selector
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
  'details',
].join(',');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }
  );
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[0].focus();
    return true;
  }
  return false;
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[elements.length - 1].focus();
    return true;
  }
  return false;
}

/**
 * Move focus to the next element in a list
 */
export function focusNextElement(
  container: HTMLElement,
  currentElement: HTMLElement,
  wrap: boolean = true
): boolean {
  const elements = getFocusableElements(container);
  const currentIndex = elements.indexOf(currentElement);

  if (currentIndex === -1) {
    return focusFirstElement(container);
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < elements.length) {
    elements[nextIndex].focus();
    return true;
  } else if (wrap) {
    elements[0].focus();
    return true;
  }

  return false;
}

/**
 * Move focus to the previous element in a list
 */
export function focusPreviousElement(
  container: HTMLElement,
  currentElement: HTMLElement,
  wrap: boolean = true
): boolean {
  const elements = getFocusableElements(container);
  const currentIndex = elements.indexOf(currentElement);

  if (currentIndex === -1) {
    return focusLastElement(container);
  }

  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    elements[prevIndex].focus();
    return true;
  } else if (wrap) {
    elements[elements.length - 1].focus();
    return true;
  }

  return false;
}

/**
 * Roving tabindex implementation for composite widgets
 * (menus, toolbars, listboxes, grids, tabs)
 */
export function createRovingTabindex(container: HTMLElement, items: HTMLElement[]) {
  if (items.length === 0) return;

  // Set initial state - first item is focusable, rest are not
  items.forEach((item, index) => {
    item.setAttribute('tabindex', index === 0 ? '0' : '-1');
  });

  let currentIndex = 0;

  const focusItem = (index: number) => {
    // Update tabindex
    items[currentIndex].setAttribute('tabindex', '-1');
    items[index].setAttribute('tabindex', '0');
    items[index].focus();
    currentIndex = index;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case Keys.ARROW_DOWN:
      case Keys.ARROW_RIGHT:
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case Keys.ARROW_UP:
      case Keys.ARROW_LEFT:
        event.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case Keys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case Keys.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      focusItem(newIndex);
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Arrow key navigation handler factory
 */
export interface ArrowNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  onNavigate?: (direction: 'next' | 'prev' | 'first' | 'last') => void;
}

export function handleArrowNavigation(
  event: KeyboardEvent,
  container: HTMLElement,
  options: ArrowNavigationOptions = {}
): boolean {
  const { orientation = 'both', wrap = true, onNavigate } = options;

  const currentElement = document.activeElement as HTMLElement;
  if (!currentElement || !container.contains(currentElement)) {
    return false;
  }

  const isVertical = orientation === 'vertical' || orientation === 'both';
  const isHorizontal = orientation === 'horizontal' || orientation === 'both';

  switch (event.key) {
    case Keys.ARROW_DOWN:
      if (isVertical) {
        event.preventDefault();
        onNavigate?.('next');
        return focusNextElement(container, currentElement, wrap);
      }
      break;
    case Keys.ARROW_UP:
      if (isVertical) {
        event.preventDefault();
        onNavigate?.('prev');
        return focusPreviousElement(container, currentElement, wrap);
      }
      break;
    case Keys.ARROW_RIGHT:
      if (isHorizontal) {
        event.preventDefault();
        onNavigate?.('next');
        return focusNextElement(container, currentElement, wrap);
      }
      break;
    case Keys.ARROW_LEFT:
      if (isHorizontal) {
        event.preventDefault();
        onNavigate?.('prev');
        return focusPreviousElement(container, currentElement, wrap);
      }
      break;
    case Keys.HOME:
      event.preventDefault();
      onNavigate?.('first');
      return focusFirstElement(container);
    case Keys.END:
      event.preventDefault();
      onNavigate?.('last');
      return focusLastElement(container);
  }

  return false;
}

/**
 * Create a keyboard shortcut handler
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function createKeyboardShortcutHandler(shortcuts: KeyboardShortcut[]) {
  return (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape to work in inputs
      if (event.key !== Keys.ESCAPE) {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const keyMatches =
        event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  };
}

/**
 * Announce keyboard shortcut availability
 */
export function getShortcutHint(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Check if user is using keyboard navigation
 */
let isUsingKeyboard = false;

export function setupKeyboardDetection() {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
    }
  };

  const handleMouseDown = () => {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
  };
}

export function isKeyboardUser(): boolean {
  return isUsingKeyboard;
}

/**
 * Type-ahead search for lists
 */
export function createTypeAheadSearch(
  items: HTMLElement[],
  getLabel: (item: HTMLElement) => string
) {
  let searchString = '';
  let searchTimeout: NodeJS.Timeout | null = null;

  return (event: KeyboardEvent) => {
    // Only handle printable characters
    if (event.key.length !== 1) return;

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Add character to search string
    searchString += event.key.toLowerCase();

    // Find matching item
    const matchingItem = items.find((item) =>
      getLabel(item).toLowerCase().startsWith(searchString)
    );

    if (matchingItem) {
      matchingItem.focus();
    }

    // Clear search string after delay
    searchTimeout = setTimeout(() => {
      searchString = '';
    }, 500);
  };
}
