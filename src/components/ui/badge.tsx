'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex shrink-0 items-center gap-0.5 rounded-full border px-3 py-1 text-caption font-medium [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-text-secondary',
        primary: 'border-transparent bg-primary text-on-primary',
        selected: 'border-primary bg-selected text-on-selected',
        male: 'border-gender-male bg-primary-soft text-gender-male',
        female: 'border-gender-female bg-primary-soft text-gender-female',
        deceased: 'border-deceased bg-deceased-surface text-deceased',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
