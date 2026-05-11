"use client"
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button, buttonVariants } from "./button"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, setMonth, setYear, getYear, getMonth } from "date-fns"
import { vi } from "date-fns/locale"

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Chọn ngày",
  error = false,
}: {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  error?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value ? parseISO(value) : new Date())
  const [view, setView] = React.useState<'days' | 'months' | 'years'>('days')
  
  const selectedDate = value ? parseISO(value) : null

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-3 border-b-2 border-foreground bg-primary/5">
        <Button 
          type="button" 
          variant="outline"
          size="icon-xs"
          onClick={() => {
            if (view === 'days') setCurrentMonth(subMonths(currentMonth, 1))
            else if (view === 'years') setCurrentMonth(subMonths(currentMonth, 120))
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <Button 
            type="button"
            variant={view === 'months' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setView(view === 'months' ? 'days' : 'months')}
            className="h-8 capitalize"
          >
            {format(currentMonth, 'MMMM', { locale: vi })}
          </Button>
          <Button 
            type="button"
            variant={view === 'years' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setView(view === 'years' ? 'days' : 'years')}
            className="h-8"
          >
            {format(currentMonth, 'yyyy')}
          </Button>
        </div>

        <Button 
          type="button" 
          variant="outline"
          size="icon-xs"
          onClick={() => {
            if (view === 'days') setCurrentMonth(addMonths(currentMonth, 1))
            else if (view === 'years') setCurrentMonth(addMonths(currentMonth, 120))
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderMonths = () => {
    const months = Array.from({ length: 12 }, (_, i) => i)
    return (
      <div className="grid grid-cols-3 gap-2 p-2 h-[282px] bg-background">
        {months.map((m) => {
          const isSelected = getMonth(currentMonth) === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setCurrentMonth(setMonth(currentMonth, m))
                setView('days')
              }}
              className={cn(
                "flex items-center justify-center border-2 border-foreground text-xs font-bold uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background cursor-pointer hover:bg-primary/10"
              )}
            >
              Th. {m + 1}
            </button>
          )
        })}
      </div>
    )
  }

  const renderYears = () => {
    const currentYear = getYear(currentMonth)
    const startYear = currentYear - 5
    const years = Array.from({ length: 12 }, (_, i) => startYear + i)
    return (
      <div className="grid grid-cols-3 gap-2 p-2 h-[282px] bg-background">
        {years.map((y) => {
          const isSelected = currentYear === y
          return (
            <button
              key={y}
              type="button"
              onClick={() => {
                setCurrentMonth(setYear(currentMonth, y))
                setView('months')
              }}
              className={cn(
                "flex items-center justify-center border-2 border-foreground text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background cursor-pointer hover:bg-primary/10"
              )}
            >
              {y}
            </button>
          )
        })}
      </div>
    )
  }

  const renderDays = () => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return (
      <div className="grid grid-cols-7 border-b-2 border-foreground bg-muted/50">
        {days.map((day, i) => (
          <div key={i} className="py-2 text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground border-r-2 border-foreground last:border-r-0">
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
              "flex h-10 w-full items-center justify-center text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background border-r-2 border-b-2 border-foreground bg-background",
              !isCurrentMonth && "text-muted-foreground/20",
              isSelected ? "bg-primary text-primary-foreground font-bold cursor-default" : "hover:bg-primary/10 cursor-pointer",
              isSameDay(day, new Date()) && !isSelected && "text-foreground font-bold ring-2 ring-inset ring-foreground"
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
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return <div className="border-l-2 border-t-2 border-foreground flex flex-col overflow-hidden">{rows}</div>
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} className="w-full">
          <div
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              "w-full justify-between",
              open && "bg-foreground text-background",
              error && "border-destructive ring-destructive",
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
             <Button 
               type="button"
               variant="destructive"
               size="xs"
               className="flex-1"
               onClick={() => {
                  onChange(null)
                  setOpen(false)
               }}
             >
               Xóa
              </Button>
             <Button 
               type="button"
               size="xs"
               className="flex-1"
               onClick={() => {
                  onChange(format(new Date(), "yyyy-MM-dd"))
                  setOpen(false)
               }}
             >
               Hôm nay
             </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
