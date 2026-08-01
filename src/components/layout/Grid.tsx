import React from 'react';
import { cn } from '../../lib/utils';
import { gridCols } from '../../lib/design-system';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(({
  className,
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = 6,
  children,
  ...props
}, ref) => {
  const colClasses = gridCols[cols];
  const smClasses = sm ? `sm:${gridCols[sm]}` : '';
  const mdClasses = md ? `md:${gridCols[md]}` : '';
  const lgClasses = lg ? `lg:${gridCols[lg]}` : '';
  const xlClasses = xl ? `xl:${gridCols[xl]}` : '';
  const gapClass = `gap-${gap}`;

  const classes = cn(
    'grid',
    colClasses,
    smClasses,
    mdClasses,
    lgClasses,
    xlClasses,
    gapClass,
    'justify-items-center',
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

Grid.displayName = 'Grid';

export { Grid };
