"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

export function Select({
  options,
  value,
  onChange,
  disabled,
  className,
  placeholder = "Chọn một tùy chọn",
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} className="w-full">
          <div
            className={cn(
              "flex h-12 w-full items-center justify-between border-2 border-foreground bg-background px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed",
              open && "bg-foreground text-background",
              className,
            )}
          >
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) p-0" align="start">
          <div className="flex flex-col py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wide text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  "hover:bg-primary hover:text-primary-foreground",
                  value === option.value && "bg-primary/10 text-primary",
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
                {value === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
