import { useState, useCallback, ImgHTMLAttributes, forwardRef } from 'react';
import { useLiveAnnouncer } from './LiveAnnouncer';

interface AccessibleImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Alt text for the image. Required for accessibility.
   * Use empty string for decorative images that should be hidden from screen readers.
   */
  alt: string;
  /**
   * If true, marks the image as decorative (aria-hidden="true")
   * Use for purely decorative images that don't convey information
   */
  decorative?: boolean;
  /**
   * Extended description for complex images (charts, diagrams, etc.)
   * Will be linked via aria-describedby
   */
  longDescription?: string;
  /**
   * Fallback content to display if image fails to load
   */
  fallback?: React.ReactNode;
  /**
   * Announce image loading state to screen readers
   */
  announceLoading?: boolean;
  /**
   * Additional CSS class for the fallback container
   */
  fallbackClassName?: string;
}

/**
 * AccessibleImage - An image component with comprehensive accessibility features
 *
 * Features:
 * - Required alt text enforcement
 * - Support for decorative images (aria-hidden)
 * - Long description support for complex images
 * - Loading state announcements for screen readers
 * - Fallback content for failed images
 */
export const AccessibleImage = forwardRef<HTMLImageElement, AccessibleImageProps>(
  (
    {
      alt,
      decorative = false,
      longDescription,
      fallback,
      announceLoading = false,
      fallbackClassName = '',
      className = '',
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const { announcePolite } = useLiveAnnouncer();
    const descriptionId = longDescription ? `img-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;

    const handleLoad = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        setStatus('loaded');
        if (announceLoading) {
          announcePolite('Image loaded');
        }
        onLoad?.(e);
      },
      [announceLoading, announcePolite, onLoad]
    );

    const handleError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        setStatus('error');
        if (announceLoading) {
          announcePolite('Image failed to load');
        }
        onError?.(e);
      },
      [announceLoading, announcePolite, onError]
    );

    // Show fallback on error
    if (status === 'error' && fallback) {
      return (
        <div
          role="img"
          aria-label={alt}
          className={`${fallbackClassName} ${className}`}
        >
          {fallback}
        </div>
      );
    }

    return (
      <>
        <img
          ref={ref}
          alt={decorative ? '' : alt}
          aria-hidden={decorative || undefined}
          aria-describedby={descriptionId}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        {longDescription && (
          <span id={descriptionId} className="sr-only">
            {longDescription}
          </span>
        )}
      </>
    );
  }
);

AccessibleImage.displayName = 'AccessibleImage';

/**
 * Utility type for ensuring alt text is provided
 */
export type ImageWithAlt = {
  src: string;
  alt: string;
};

/**
 * Hook to validate image alt text
 * Returns validation status and error messages
 */
export function useImageAltValidation(alt: string) {
  const isEmpty = !alt || alt.trim() === '';
  const isTooShort = alt.length > 0 && alt.length < 3;
  const containsFileName = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(alt);
  const containsImageWord = /^image\s|image\sof\s|picture\s|photo\s|graphic\s/i.test(alt);

  const warnings: string[] = [];

  if (isEmpty) {
    warnings.push('Alt text is empty. If this is a decorative image, mark it as decorative.');
  }
  if (isTooShort) {
    warnings.push('Alt text is very short. Consider adding more description.');
  }
  if (containsFileName) {
    warnings.push('Alt text appears to contain a filename. Use descriptive text instead.');
  }
  if (containsImageWord) {
    warnings.push('Avoid starting alt text with "image of" or similar phrases - screen readers already announce it as an image.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * FigureWithCaption - Accessible figure with image and caption
 */
interface FigureWithCaptionProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  imageClassName?: string;
  captionClassName?: string;
}

export function FigureWithCaption({
  src,
  alt,
  caption,
  className = '',
  imageClassName = '',
  captionClassName = '',
}: FigureWithCaptionProps) {
  return (
    <figure className={className} role="figure" aria-label={caption}>
      <AccessibleImage
        src={src}
        alt={alt}
        className={imageClassName}
      />
      <figcaption className={captionClassName}>
        {caption}
      </figcaption>
    </figure>
  );
}

export default AccessibleImage;
