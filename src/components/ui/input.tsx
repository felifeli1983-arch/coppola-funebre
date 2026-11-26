import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors md:h-9 md:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm md:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

/** Native <select> styled like the inputs — works inside plain <form> posts. */
// Chevron drawn as an inline background (an arbitrary Tailwind url() class with
// escaped quotes is not picked up by the class scanner).
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3e%3c/svg%3e\")";

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, style, ...props }, ref) => (
    <select
      className={cn(
        'flex h-10 w-full min-w-0 appearance-none rounded-md border border-input bg-background px-3 pr-8 py-1 text-base shadow-sm md:h-9 md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        backgroundImage: SELECT_CHEVRON,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.6rem center',
        backgroundSize: '16px',
        ...style,
      }}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  ),
);
NativeSelect.displayName = 'NativeSelect';

export { Input, Textarea, NativeSelect };
