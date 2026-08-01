import React from 'react';
import { Loader2 } from 'lucide-react';
import { buttonVariants, buttonSizes } from '../../lib/design-system';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'base',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}, ref) => {
  const baseClasses = buttonVariants[variant].base;
  const hoverClasses = buttonVariants[variant].hover || '';
  const focusClasses = buttonVariants[variant].focus || '';
  const disabledClasses = disabled ? buttonVariants[variant].disabled || 'opacity-50 cursor-not-allowed' : '';
  const sizeClasses = buttonSizes[size];
  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = cn(
    baseClasses,
    hoverClasses,
    focusClasses,
    disabledClasses,
    sizeClasses,
    widthClasses,
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none',
    className
  );

  const renderIcon = () => {
    if (!icon && !loading) return null;
    
    if (loading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    return icon;
  };

  return (
    <button
      className={classes}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon() && (
        <span className="mr-2">{renderIcon()}</span>
      )}
      {children}
      {iconPosition === 'right' && renderIcon() && (
        <span className="ml-2">{renderIcon()}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
