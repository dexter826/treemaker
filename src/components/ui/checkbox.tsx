"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// Component Checkbox chuẩn UI theo kiến trúc Base UI.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-none border-2 border-foreground bg-background transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        "data-checked:bg-primary data-checked:border-primary data-checked:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator 
        data-slot="checkbox-indicator"
        className="flex h-full w-full items-center justify-center text-current"
      >
        <Check className="size-3 stroke-[3.5px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
