import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  contained?: boolean;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background?: 'white' | 'gray' | 'primary' | 'secondary' | 'image';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundImage?: string;
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageOverlay?: 'none' | 'light' | 'medium' | 'dark';
  imageOverlayColor?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(({
  className,
  id,
  contained = true,
  containerSize = 'xl',
  background = 'white',
  padding = 'lg',
  backgroundImage,
  imagePosition = 'center',
  imageOverlay = 'none',
  imageOverlayColor,
  children,
  ...props
}, ref) => {
  const backgroundClasses: Record<string, string> = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'bg-primary-50',
    secondary: 'bg-secondary-50',
    image: '',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
  };

  const imagePositionClasses = {
    center: 'bg-center',
    top: 'bg-top',
    bottom: 'bg-bottom',
    left: 'bg-left',
    right: 'bg-right',
  };

  const overlayClasses = {
    none: '',
    light: 'bg-black/20',
    medium: 'bg-black/40',
    dark: 'bg-black/60',
  };

  // Build background style
  const backgroundStyle = background === 'image' && backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: imagePosition,
      }
    : undefined;

  const classes = cn(
    background !== 'image' && backgroundClasses[background],
    paddingClasses[padding],
    background === 'image' && imagePositionClasses[imagePosition],
    className
  );

  const content = contained ? (
    <div className={`container-${containerSize} mx-auto px-4 sm:px-6 lg:px-8`}>
      {children}
    </div>
  ) : (
    children
  );

  return (
    <section
      ref={ref}
      id={id}
      className={classes}
      style={backgroundStyle}
      {...props}
    >
      {/* Image Overlay */}
      {background === 'image' && imageOverlay !== 'none' && (
        <div
          className={`absolute inset-0 ${overlayClasses[imageOverlay]} ${imageOverlayColor || ''}`}
          style={imageOverlayColor ? { backgroundColor: imageOverlayColor } : undefined}
        />
      )}

      {/* Content */}
      <div className={background === 'image' && imageOverlay !== 'none' ? 'relative z-10' : ''}>
        {content}
      </div>
    </section>
  );
});

Section.displayName = 'Section';

export { Section };
