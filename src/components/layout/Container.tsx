import React from 'react';
import { cn } from '../../lib/utils';
import { containerSizes } from '../../lib/design-system';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({
  className,
  size = 'xl',
  centered = true,
  children,
  ...props
}, ref) => {
  const sizeClass = containerSizes[size];
  const centerClass = centered ? 'mx-auto' : '';
  const paddingClass = 'px-4 sm:px-6 lg:px-8';

  const classes = cn(
    sizeClass,
    centerClass,
    paddingClass,
    className
  );

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export { Container };
