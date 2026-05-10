"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { buttonVariants } from "./button"
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
  showSearch = false,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  showSearch?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchTerm("")
    }
    setOpen(isOpen)
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger disabled={disabled} className="w-full">
          <div
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              "w-full justify-between",
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
            {showSearch && (
              <div className="p-3 border-b-2 border-foreground bg-primary/5 flex-shrink-0">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-foreground/70" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 pl-10 pr-4 text-xs border-foreground/30 focus:border-foreground bg-background"
                  />
                </div>
              </div>
            )}
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="flex flex-col py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "flex items-center justify-between border-2 border-transparent px-4 py-3 text-left text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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

