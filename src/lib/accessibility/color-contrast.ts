/**
 * Color Contrast Utilities for WCAG 2.1 AA Compliance
 *
 * WCAG 2.1 AA requires:
 * - Normal text: 4.5:1 minimum contrast ratio
 * - Large text (18pt+ or 14pt+ bold): 3:1 minimum contrast ratio
 * - UI components and graphics: 3:1 minimum contrast ratio
 *
 * WCAG 2.1 AAA requires:
 * - Normal text: 7:1 minimum contrast ratio
 * - Large text: 4.5:1 minimum contrast ratio
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Parse HSL string (e.g., "188 86% 37%") to HSL object
 */
export function parseHslString(hslString: string): HSL | null {
  // Handle both "188 86% 37%" and "hsl(188, 86%, 37%)" formats
  const match = hslString.match(/(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%?\s*,?\s*(\d+(?:\.\d+)?)%?/);
  if (!match) return null;

  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

/**
 * Calculate relative luminance of an RGB color
 * Per WCAG 2.1 specification
 */
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio from 1:1 (no contrast) to 21:1 (max contrast)
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

/**
 * Check WCAG compliance level for a contrast ratio
 */
export function getWCAGCompliance(
  ratio: number,
  isLargeText: boolean = false
): { level: WCAGLevel; passes: { aa: boolean; aaa: boolean } } {
  // Large text thresholds
  if (isLargeText) {
    return {
      level: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail',
      passes: {
        aa: ratio >= 3,
        aaa: ratio >= 4.5,
      },
    };
  }

  // Normal text thresholds
  return {
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA-large' : 'fail',
    passes: {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    },
  };
}

/**
 * Find the closest accessible color by adjusting lightness
 */
export function findAccessibleColor(
  foreground: RGB,
  background: RGB,
  targetRatio: number = 4.5
): RGB {
  const fgHsl = rgbToHsl(foreground.r, foreground.g, foreground.b);
  const bgLuminance = getRelativeLuminance(background);

  // Determine if we need to lighten or darken
  const shouldLighten = bgLuminance > 0.5;

  // Binary search for the right lightness
  let low = shouldLighten ? fgHsl.l : 0;
  let high = shouldLighten ? 100 : fgHsl.l;
  let bestColor = foreground;
  let bestRatio = getContrastRatio(foreground, background);

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const testRgb = hslToRgb(fgHsl.h, fgHsl.s, mid);
    const ratio = getContrastRatio(testRgb, background);

    if (Math.abs(ratio - targetRatio) < Math.abs(bestRatio - targetRatio)) {
      bestColor = testRgb;
      bestRatio = ratio;
    }

    if (ratio < targetRatio) {
      if (shouldLighten) {
        high = mid;
      } else {
        low = mid;
      }
    } else {
      if (shouldLighten) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  return bestColor;
}

/**
 * Check contrast and suggest fixes if needed
 */
export interface ContrastCheckResult {
  ratio: number;
  ratioString: string;
  compliance: ReturnType<typeof getWCAGCompliance>;
  isAccessible: boolean;
  suggestion?: {
    adjustedColor: RGB;
    adjustedHex: string;
    newRatio: number;
  };
}

export function checkContrast(
  foreground: string | RGB,
  background: string | RGB,
  options: { isLargeText?: boolean; targetLevel?: 'AA' | 'AAA' } = {}
): ContrastCheckResult {
  const { isLargeText = false, targetLevel = 'AA' } = options;

  // Convert to RGB if hex strings provided
  const fgRgb = typeof foreground === 'string' ? hexToRgb(foreground) : foreground;
  const bgRgb = typeof background === 'string' ? hexToRgb(background) : background;

  if (!fgRgb || !bgRgb) {
    throw new Error('Invalid color format');
  }

  const ratio = getContrastRatio(fgRgb, bgRgb);
  const compliance = getWCAGCompliance(ratio, isLargeText);
  const targetRatio = targetLevel === 'AAA' ? (isLargeText ? 4.5 : 7) : (isLargeText ? 3 : 4.5);
  const isAccessible = ratio >= targetRatio;

  const result: ContrastCheckResult = {
    ratio,
    ratioString: `${ratio.toFixed(2)}:1`,
    compliance,
    isAccessible,
  };

  // Suggest a fix if not accessible
  if (!isAccessible) {
    const adjustedColor = findAccessibleColor(fgRgb, bgRgb, targetRatio);
    const newRatio = getContrastRatio(adjustedColor, bgRgb);

    result.suggestion = {
      adjustedColor,
      adjustedHex: rgbToHex(adjustedColor.r, adjustedColor.g, adjustedColor.b),
      newRatio,
    };
  }

  return result;
}

/**
 * Utility to check if a color is light or dark
 */
export function isLightColor(color: string | RGB): boolean {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color;
  if (!rgb) return false;
  return getRelativeLuminance(rgb) > 0.5;
}

/**
 * Get appropriate text color (black or white) for a background
 */
export function getTextColorForBackground(background: string | RGB): string {
  return isLightColor(background) ? '#000000' : '#ffffff';
}

/**
 * Predefined accessible color pairs
 */
export const accessibleColorPairs = {
  // High contrast pairs (7:1+ for AAA)
  blackOnWhite: { foreground: '#000000', background: '#ffffff', ratio: 21 },
  whiteOnBlack: { foreground: '#ffffff', background: '#000000', ratio: 21 },
  darkBlueOnWhite: { foreground: '#003366', background: '#ffffff', ratio: 12.6 },
  whiteOnDarkBlue: { foreground: '#ffffff', background: '#003366', ratio: 12.6 },

  // Good contrast pairs (4.5:1+ for AA)
  grayOnWhite: { foreground: '#595959', background: '#ffffff', ratio: 7 },
  whiteOnGray: { foreground: '#ffffff', background: '#595959', ratio: 7 },
  blueOnWhite: { foreground: '#0066cc', background: '#ffffff', ratio: 5.9 },
  whiteOnBlue: { foreground: '#ffffff', background: '#0066cc', ratio: 5.9 },
};
