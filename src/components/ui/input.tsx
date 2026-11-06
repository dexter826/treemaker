import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        aria-invalid={error || undefined}
        className={cn(
          'border-border bg-surface placeholder:text-text-muted rounded-control text-body focus-visible:border-primary h-11 w-full min-w-0 border px-3 font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus-visible:border-danger',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
