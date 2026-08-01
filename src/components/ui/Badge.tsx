import React from 'react';
import { cn } from '../../lib/utils';
import { badgeVariants } from '../../lib/design-system';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'sale' | 'featured';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({
  className,
  variant = 'primary',
  children,
  ...props
}, ref) => {
  const classes = cn(
    badgeVariants[variant],
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

Badge.displayName = 'Badge';

export { Badge };
