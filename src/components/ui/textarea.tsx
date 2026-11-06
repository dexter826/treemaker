import * as React from 'react';

import { cn } from '@/lib/utils';
import { useFieldDescribedBy } from './field';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  const describedBy = useFieldDescribedBy();
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error || undefined}
      aria-describedby={describedBy}
      className={cn(
        'border-border bg-surface placeholder:text-text-muted rounded-control text-body focus-visible:border-primary min-h-24 w-full border px-3 py-2 font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus-visible:border-danger',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
