import * as React from 'react';

import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error || undefined}
      className={cn(
        'border-border bg-surface placeholder:text-text-muted rounded-control px-sm py-xs text-body focus-visible:border-primary min-h-24 w-full border font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus-visible:border-danger',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
