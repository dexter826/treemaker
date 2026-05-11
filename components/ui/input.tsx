import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-none border-2 border-foreground bg-background px-4 py-2 text-sm font-semibold transition-all outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-destructive focus:border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
