import React from 'react';
import { Section, SectionProps } from './Section';
import { useSectionImage } from '../../hooks/useSectionImage';

export interface DatabaseSectionProps extends Omit<SectionProps, 'backgroundImage'> {
  // Database image source
  imageType?: 'category' | 'product';
  imageId?: string;
  imageSlug?: string;
  // Fallback image if database fetch fails
  fallbackImage?: string;
}

const DatabaseSection = React.forwardRef<HTMLElement, DatabaseSectionProps>(({
  imageType,
  imageId,
  imageSlug,
  fallbackImage = '',
  children,
  ...sectionProps
}, ref) => {
  const { imageUrl, loading } = useSectionImage({
    type: imageType || 'category',
    id: imageId,
    slug: imageSlug,
  });

  // Use database image, fallback to provided fallback, or empty string
  const finalImage = imageUrl || fallbackImage;

  return (
    <Section
      ref={ref}
      {...sectionProps}
      background={finalImage ? 'image' : sectionProps.background}
      backgroundImage={finalImage}
    >
      {loading && !finalImage && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      )}
      {children}
    </Section>
  );
});

DatabaseSection.displayName = 'DatabaseSection';

export { DatabaseSection };
