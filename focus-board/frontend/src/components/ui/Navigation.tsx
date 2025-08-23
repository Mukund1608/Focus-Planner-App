import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Tabs Component
const tabsVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950",
  {
    variants: {
      variant: {
        default: "bg-transparent text-neutral-500 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm dark:text-neutral-400 dark:hover:text-neutral-50 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50",
        outline: "border border-neutral-200 bg-transparent text-neutral-500 hover:text-neutral-900 data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-50 dark:data-[state=active]:bg-neutral-800 dark:data-[state=active]:text-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function Tabs({ className, variant, orientation = 'horizontal', value, onValueChange, children, ...props }: TabsProps) {
  return (
    <div
      className={cn(
        "flex",
        orientation === 'vertical' ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            variant,
            orientation,
            value,
            onValueChange,
          } as any);
        }
        return child;
      })}
    </div>
  );
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: VariantProps<typeof tabsVariants>['variant'];
  orientation?: 'horizontal' | 'vertical';
  isActive?: boolean;
  onValueChange?: (value: string) => void;
}

export function Tab({ 
  className, 
  variant, 
  orientation = 'horizontal',
  value,
  isActive,
  onValueChange,
  children,
  ...props 
}: TabProps) {
  return (
    <button
      className={cn(
        tabsVariants({ variant }),
        orientation === 'vertical' ? "justify-start" : "justify-center",
        isActive && "data-[state=active]:true",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
}

// Breadcrumbs Component
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumbs({ items, separator = "/", className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400", className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-1 text-neutral-300 dark:text-neutral-600">
              {separator}
            </span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="flex items-center hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </a>
          ) : (
            <span className="flex items-center text-neutral-900 dark:text-neutral-50">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Navigation Menu Component
export interface NavigationMenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavigationMenuItem[];
  disabled?: boolean;
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function NavigationMenu({ items, orientation = 'horizontal', className }: NavigationMenuProps) {
  return (
    <nav className={cn(
      "flex",
      orientation === 'vertical' ? "flex-col space-y-1" : "flex-row space-x-1",
      className
    )}>
      {items.map((item, index) => (
        <NavigationMenuItem key={index} item={item} orientation={orientation} />
      ))}
    </nav>
  );
}

function NavigationMenuItem({ item, orientation }: { item: NavigationMenuItem; orientation: 'horizontal' | 'vertical' }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const content = (
    <div className="flex items-center">
      {item.icon && <span className="mr-2">{item.icon}</span>}
      {item.label}
      {item.children && (
        <svg
          className={cn(
            "ml-1 h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="relative">
      {item.href ? (
        <a
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
            "dark:text-neutral-400 dark:hover:text-neutral-50 dark:hover:bg-neutral-800",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={item.children ? (e) => { e.preventDefault(); setIsOpen(!isOpen); } : undefined}
        >
          {content}
        </a>
      ) : (
        <button
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
            "dark:text-neutral-400 dark:hover:text-neutral-50 dark:hover:bg-neutral-800",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={item.children ? () => setIsOpen(!isOpen) : undefined}
          disabled={item.disabled}
        >
          {content}
        </button>
      )}

      {item.children && isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 min-w-[200px] rounded-lg border border-neutral-200 bg-white p-1 shadow-soft",
          "dark:border-neutral-700 dark:bg-neutral-900",
          orientation === 'horizontal' ? "top-full left-0" : "left-full top-0 ml-1"
        )}>
          {item.children.map((child, index) => (
            <NavigationMenuItem key={index} item={child} orientation={orientation} />
          ))}
        </div>
      )}
    </div>
  );
}
