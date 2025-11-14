/**
 * Page Analyzer - Provides smart suggestions and conversion score for landing pages
 */

export interface PageContent {
  headline?: string;
  subheadline?: string;
  button_text?: string;
  primary_color?: string;
}

export interface Suggestion {
  type: 'warning' | 'error' | 'tip';
  field: string;
  message: string;
  suggestion?: string;
}

const ACTION_VERBS = ['get', 'download', 'start', 'access', 'claim', 'grab', 'unlock', 'discover'];
const WEAK_BUTTON_WORDS = ['click', 'here', 'submit', 'enter', 'go'];

/**
 * Calculates color contrast ratio between two hex colors
 */
function getContrastRatio(color1: string, color2: string = '#FFFFFF'): number {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  try {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 7; // Default to passing ratio
  }
}

/**
 * Analyzes page content and returns suggestions for improvement
 */
export function analyzePage(content: PageContent, hasResources: boolean = true): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Headline analysis
  if (content.headline) {
    if (content.headline.length > 60) {
      suggestions.push({
        type: 'warning',
        field: 'headline',
        message: `Headline is ${content.headline.length} characters (recommended: under 60)`,
        suggestion: 'Shorter headlines are more impactful and mobile-friendly'
      });
    }

    if (content.headline.length < 10) {
      suggestions.push({
        type: 'warning',
        field: 'headline',
        message: 'Headline is too short',
        suggestion: 'Add more context to capture attention (aim for 20-60 characters)'
      });
    }

    if (!content.headline.trim()) {
      suggestions.push({
        type: 'error',
        field: 'headline',
        message: 'Headline is required',
        suggestion: 'Add a compelling headline to grab attention'
      });
    }
  } else {
    suggestions.push({
      type: 'error',
      field: 'headline',
      message: 'Missing headline',
      suggestion: 'Add a headline to communicate your value proposition'
    });
  }

  // Subheadline analysis
  if (content.subheadline) {
    if (content.subheadline.length > 120) {
      suggestions.push({
        type: 'tip',
        field: 'subheadline',
        message: 'Subheadline is quite long',
        suggestion: 'Keep it concise to maintain reader attention'
      });
    }
  }

  // Button text analysis
  if (content.button_text) {
    const buttonLower = content.button_text.toLowerCase();
    const hasActionVerb = ACTION_VERBS.some(verb => buttonLower.includes(verb));
    const hasWeakWord = WEAK_BUTTON_WORDS.some(word => buttonLower === word || buttonLower.startsWith(word + ' '));

    if (!hasActionVerb) {
      suggestions.push({
        type: 'tip',
        field: 'button_text',
        message: 'Button text lacks action verb',
        suggestion: `Try using action verbs like: ${ACTION_VERBS.slice(0, 3).map(v => `"${v.charAt(0).toUpperCase() + v.slice(1)} [Resource]"`).join(', ')}`
      });
    }

    if (hasWeakWord) {
      suggestions.push({
        type: 'warning',
        field: 'button_text',
        message: 'Button text is generic',
        suggestion: 'Use specific action words that describe the value (e.g., "Download Template", "Get Started Free")'
      });
    }

    if (content.button_text.length > 25) {
      suggestions.push({
        type: 'tip',
        field: 'button_text',
        message: 'Button text is too long',
        suggestion: 'Keep button text short and actionable (under 20 characters)'
      });
    }
  } else {
    suggestions.push({
      type: 'error',
      field: 'button_text',
      message: 'Missing button text',
      suggestion: 'Add clear call-to-action text'
    });
  }

  // Color contrast analysis
  if (content.primary_color) {
    const contrastRatio = getContrastRatio(content.primary_color);

    if (contrastRatio < 4.5) {
      suggestions.push({
        type: 'warning',
        field: 'primary_color',
        message: 'Poor color contrast detected',
        suggestion: 'Use a darker or lighter color for better readability (current ratio: ' + contrastRatio.toFixed(1) + ':1, recommended: 4.5:1)'
      });
    }
  }

  // Resource check
  if (!hasResources) {
    suggestions.push({
      type: 'error',
      field: 'resources',
      message: 'No resources attached',
      suggestion: 'Add at least one downloadable resource to provide value'
    });
  }

  return suggestions;
}

/**
 * Calculates a conversion score (0-100) based on page quality
 */
export function calculateScore(content: PageContent, hasResources: boolean = true): number {
  let score = 100;
  const suggestions = analyzePage(content, hasResources);

  // Deduct points based on suggestion severity
  suggestions.forEach(suggestion => {
    switch (suggestion.type) {
      case 'error':
        score -= 15;
        break;
      case 'warning':
        score -= 8;
        break;
      case 'tip':
        score -= 3;
        break;
    }
  });

  // Bonus points for good practices
  if (content.headline && content.headline.length >= 20 && content.headline.length <= 60) {
    score += 5;
  }

  if (content.button_text) {
    const hasActionVerb = ACTION_VERBS.some(verb =>
      content.button_text!.toLowerCase().includes(verb)
    );
    if (hasActionVerb) {
      score += 5;
    }
  }

  if (content.subheadline && content.subheadline.length > 0) {
    score += 5;
  }

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Gets a letter grade based on score
 */
export function getGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: 'A', color: 'text-green-600', label: 'Excellent' };
  if (score >= 80) return { grade: 'B', color: 'text-blue-600', label: 'Good' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-600', label: 'Fair' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-600', label: 'Needs Work' };
  return { grade: 'F', color: 'text-red-600', label: 'Poor' };
}
