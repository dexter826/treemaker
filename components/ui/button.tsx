import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex cursor-pointer shrink-0 items-center justify-center gap-2 rounded-none border-2 border-foreground bg-clip-padding text-sm font-bold uppercase tracking-widest transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        outline:
          "bg-background text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        ghost:
          "border-transparent bg-transparent text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        destructive:
          "border-foreground bg-destructive text-destructive-foreground hover:bg-foreground hover:text-background",
        link:
          "h-auto border-0 bg-transparent px-0 text-primary underline-offset-4 hover:border-0 hover:bg-transparent hover:text-primary hover:underline",
      },
      size: {
        default: "h-12 px-6",
        xs: "h-8 px-3 text-[10px]",
        sm: "h-10 px-4",
        lg: "h-14 px-8 text-base",
        icon: "size-12",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
      effect: {
        none: "",
        raised:
          "shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      effect: "none",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  effect = "none",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, effect, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
