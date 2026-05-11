import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-none border-2 border-foreground bg-background px-4 py-3 text-sm font-semibold transition-all outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed",
        error && "border-destructive focus:border-destructive focus-visible:ring-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
