"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, Search } from "lucide-react"
import { ScrollArea } from "./scroll-area"
import { Input } from "./input"

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
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  // Reset search when opening/closing
  React.useEffect(() => {
    if (!open) {
      setSearchTerm("")
    }
  }, [open])

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
        <PopoverContent 
          className="w-(--anchor-width) p-0 z-50" 
          align="start" 
          side="bottom" 
          sideOffset={2}
        >
          <div className="flex flex-col max-h-[400px] overflow-hidden">
            <div className="p-2 border-b-2 border-foreground bg-primary/5 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-9 text-xs border-foreground/20 focus:border-foreground"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="flex flex-col py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
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
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    Không tìm thấy kết quả
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

