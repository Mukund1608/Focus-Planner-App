import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Form Field Component
export interface FormFieldProps {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  description?: string;
}

export function FormField({
  label,
  error,
  success,
  required,
  disabled,
  children,
  className,
  labelClassName,
  description,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          disabled && "opacity-50",
          labelClassName
        )}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {children}
      {(error || success) && (
        <p className={cn(
          "text-xs",
          error ? "text-error-500" : "text-accent-500"
        )}>
          {error || success}
        </p>
      )}
    </div>
  );
}

// Form Component
const formVariants = cva(
  "space-y-6",
  {
    variants: {
      layout: {
        default: "",
        horizontal: "grid grid-cols-1 md:grid-cols-3 gap-4 items-start",
        compact: "space-y-4",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
);

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {}

export function Form({ className, layout, children, ...props }: FormProps) {
  return (
    <form className={cn(formVariants({ layout, className }))} {...props}>
      {children}
    </form>
  );
}

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  success?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, ...props }, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:ring-offset-neutral-900 dark:placeholder:text-neutral-400 dark:focus-visible:ring-primary-500",
          hasError && "border-error-500 focus-visible:ring-error-500 dark:border-error-500",
          hasSuccess && "border-accent-500 focus-visible:ring-accent-500 dark:border-accent-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// Select Component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  error?: string;
  success?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, success, onChange, placeholder, ...props }, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:ring-offset-neutral-900 dark:focus-visible:ring-primary-500",
          hasError && "border-error-500 focus-visible:ring-error-500 dark:border-error-500",
          hasSuccess && "border-accent-500 focus-visible:ring-accent-500 dark:border-accent-500",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

// Checkbox Component
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:focus:ring-primary-500",
            error && "border-error-500 focus:ring-error-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Radio Component
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          className={cn(
            "h-4 w-4 border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:focus:ring-primary-500",
            error && "border-error-500 focus:ring-error-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = "Radio";

// Form Actions Component
export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end space-x-2", className)}>
      {children}
    </div>
  );
}
