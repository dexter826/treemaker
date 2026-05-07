"use client"
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, setMonth, setYear, getYear, getMonth } from "date-fns"
import { vi } from "date-fns/locale"

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Chọn ngày"
}: {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value ? parseISO(value) : new Date())
  const [view, setView] = React.useState<'days' | 'months' | 'years'>('days')
  
  const selectedDate = value ? parseISO(value) : null

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-3 border-b-2 border-foreground bg-primary/5">
        <button 
          type="button" 
          onClick={() => {
            if (view === 'days') setCurrentMonth(subMonths(currentMonth, 1))
            else if (view === 'years') setCurrentMonth(subMonths(currentMonth, 120))
          }}
          className="p-1 hover:bg-foreground hover:text-background transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setView(view === 'months' ? 'days' : 'months')}
            className={cn(
              "font-bold text-sm px-2 py-1 hover:bg-foreground/10 transition-colors rounded capitalize",
              view === 'months' && "bg-primary text-primary-foreground"
            )}
          >
            {format(currentMonth, 'MMMM', { locale: vi })}
          </button>
          <button 
            type="button"
            onClick={() => setView(view === 'years' ? 'days' : 'years')}
            className={cn(
              "font-bold text-sm px-2 py-1 hover:bg-foreground/10 transition-colors rounded",
              view === 'years' && "bg-primary text-primary-foreground"
            )}
          >
            {format(currentMonth, 'yyyy')}
          </button>
        </div>

        <button 
          type="button" 
          onClick={() => {
            if (view === 'days') setCurrentMonth(addMonths(currentMonth, 1))
            else if (view === 'years') setCurrentMonth(addMonths(currentMonth, 120))
          }}
          className="p-1 hover:bg-foreground hover:text-background transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const renderMonths = () => {
    const months = Array.from({ length: 12 }, (_, i) => i)
    return (
      <div className="grid grid-cols-3 gap-2 p-2 h-[282px] bg-background">
        {months.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setCurrentMonth(setMonth(currentMonth, m))
              setView('days')
            }}
            className={cn(
              "flex items-center justify-center text-xs font-bold uppercase tracking-widest border border-foreground/10 hover:bg-primary/10",
              getMonth(currentMonth) === m && "bg-primary text-primary-foreground"
            )}
          >
            Th. {m + 1}
          </button>
        ))}
      </div>
    )
  }

  const renderYears = () => {
    const currentYear = getYear(currentMonth)
    const startYear = currentYear - 5
    const years = Array.from({ length: 12 }, (_, i) => startYear + i)
    return (
      <div className="grid grid-cols-3 gap-2 p-2 h-[282px] bg-background">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => {
              setCurrentMonth(setYear(currentMonth, y))
              setView('months')
            }}
            className={cn(
              "flex items-center justify-center text-xs font-bold border border-foreground/10 hover:bg-primary/10",
              currentYear === y && "bg-primary text-primary-foreground"
            )}
          >
            {y}
          </button>
        ))}
      </div>
    )
  }

  const renderDays = () => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return (
      <div className="grid grid-cols-7 border-b-2 border-foreground bg-muted/50">
        {days.map((day, i) => (
          <div key={i} className="py-2 text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        const isSelected = selectedDate && isSameDay(day, selectedDate)
        const isCurrentMonth = isSameMonth(day, monthStart)
        
        days.push(
          <button
            key={day.toString()}
            type="button"
            className={cn(
              "h-10 w-full flex items-center justify-center text-xs font-medium transition-all border-r border-b border-foreground/5 last:border-r-0",
              !isCurrentMonth && "text-muted-foreground/20",
              isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-primary/10",
              isSameDay(day, new Date()) && !isSelected && "text-primary font-bold ring-1 ring-inset ring-primary/30"
            )}
            onClick={() => {
              onChange(format(cloneDay, "yyyy-MM-dd"))
              setOpen(false)
            }}
          >
            {formattedDate}
          </button>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7 last:border-b-0" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return <div className="bg-background h-[282px]">{rows}</div>
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} className="w-full">
          <div
            className={cn(
              "flex h-12 w-full items-center justify-between border-2 border-foreground bg-background px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all cursor-pointer",
              "hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed",
              open && "bg-foreground text-background",
              className
            )}
          >
            <span className="truncate">{selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}</span>
            <CalendarIcon className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0"
          align="start"
        >
          {renderHeader()}
          {view === 'days' && (
            <>
              {renderDays()}
              {renderCells()}
            </>
          )}
          {view === 'months' && renderMonths()}
          {view === 'years' && renderYears()}
          <div className="p-2 border-t-2 border-foreground flex gap-2">
             <button 
               type="button"
               className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors border border-foreground"
               onClick={() => {
                  onChange(null)
                  setOpen(false)
               }}
             >
               Xóa
             </button>
             <button 
               type="button"
               className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-foreground transition-colors"
               onClick={() => {
                  onChange(format(new Date(), "yyyy-MM-dd"))
                  setOpen(false)
               }}
             >
               Hôm nay
             </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
