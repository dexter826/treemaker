import * as React from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex cursor-pointer shrink-0 items-center justify-center gap-1.5 rounded-control border text-button font-semibold outline-none select-none transition-[background-color,border-color,color,transform] duration-(--motion-press) ease-(--ease-standard) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-primary text-on-primary hover:bg-primary-hover active:translate-y-px',
        secondary:
          'border-border bg-transparent text-text-primary hover:bg-primary-soft',
        ghost:
          'border-transparent bg-transparent text-text-primary hover:bg-primary-soft',
        inset:
          'border-transparent bg-transparent text-text-secondary hover:text-primary hover:bg-transparent active:text-primary',
        danger:
          'border-transparent bg-danger text-on-danger hover:brightness-95 active:translate-y-px',
        link: 'h-auto border-0 bg-transparent px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5',
        lg: 'h-12 px-6 text-body-sm',
        icon: 'size-11 px-0',
        'icon-lg': 'size-12 px-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
