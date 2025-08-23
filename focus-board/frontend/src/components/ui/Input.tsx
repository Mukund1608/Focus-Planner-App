import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  inputSize?: 'default' | 'sm' | 'lg';
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'default', ...props }, ref) => {
    const inputVariants = {
      variant: {
        default: 'border-border-light focus:border-blue-accent focus:ring-blue-accent',
        error: 'border-danger focus:border-danger focus:ring-danger',
        success: 'border-success focus:border-success focus:ring-success'
      },
      size: {
        default: 'h-10 px-3 py-2 text-body',
        sm: 'h-8 px-2 py-1 text-caption',
        lg: 'h-12 px-4 py-3 text-body-lg'
      }
    };

    return (
      <input
        className={cn(
          'flex w-full rounded-lg border bg-surface-light px-3 py-2 text-text-primary-light placeholder:text-text-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          inputVariants.variant[variant],
          inputVariants.size[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
export type { InputProps };
