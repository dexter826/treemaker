'use client';
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button, buttonVariants } from './button';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  setMonth,
  setYear,
  getYear,
  getMonth,
} from 'date-fns';
import { vi } from 'date-fns/locale';

// parseISO trả Invalid Date (một object truthy) cho chuỗi không chuẩn; nếu để
// lọt thì format() ném RangeError và làm sập toàn bộ cây render.
const parseDateValue = (value: string): Date | null => {
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const cellBase =
  'flex h-11 w-full cursor-pointer items-center justify-center rounded-control text-body-sm tabular-nums transition-colors';

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Chọn ngày',
  error = false,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  error?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    value ? (parseDateValue(value) ?? new Date()) : new Date()
  );
  const [view, setView] = React.useState<'days' | 'months' | 'years'>('days');

  const selectedDate = value ? parseDateValue(value) : null;

  const renderHeader = () => (
    <div className="border-border-default px-xs py-xs flex items-center justify-between border-b">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Tháng trước"
        onClick={() => {
          if (view === 'days') setCurrentMonth(subMonths(currentMonth, 1));
          else if (view === 'years')
            setCurrentMonth(subMonths(currentMonth, 120));
        }}
      >
        <ChevronLeft />
      </Button>

      <div className="gap-xxs flex items-center">
        <Button
          type="button"
          variant={view === 'months' ? 'secondary' : 'ghost'}
          onClick={() => setView(view === 'months' ? 'days' : 'months')}
        >
          {format(currentMonth, 'MMMM', { locale: vi })}
        </Button>
        <Button
          type="button"
          variant={view === 'years' ? 'secondary' : 'ghost'}
          onClick={() => setView(view === 'years' ? 'days' : 'years')}
        >
          {format(currentMonth, 'yyyy')}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Tháng sau"
        onClick={() => {
          if (view === 'days') setCurrentMonth(addMonths(currentMonth, 1));
          else if (view === 'years')
            setCurrentMonth(addMonths(currentMonth, 120));
        }}
      >
        <ChevronRight />
      </Button>
    </div>
  );

  const renderMonths = () => (
    <div className="gap-xxs p-xs grid grid-cols-3">
      {Array.from({ length: 12 }, (_, m) => {
        const isSelected = getMonth(currentMonth) === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => {
              setCurrentMonth(setMonth(currentMonth, m));
              setView('days');
            }}
            className={cn(
              cellBase,
              isSelected
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-text-primary hover:bg-primary-soft'
            )}
          >
            Th. {m + 1}
          </button>
        );
      })}
    </div>
  );

  const renderYears = () => {
    const currentYear = getYear(currentMonth);
    const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);
    return (
      <div className="gap-xxs p-xs grid grid-cols-3">
        {years.map((y) => {
          const isSelected = currentYear === y;
          return (
            <button
              key={y}
              type="button"
              onClick={() => {
                setCurrentMonth(setYear(currentMonth, y));
                setView('months');
              }}
              className={cn(
                cellBase,
                isSelected
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-text-primary hover:bg-primary-soft'
              )}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  const renderWeekdays = () => (
    <div className="px-xs pb-2xxs grid grid-cols-7">
      {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
        <div
          key={day}
          className="text-text-secondary text-caption h-8 text-center"
        >
          {day}
        </div>
      ))}
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(endOfMonth(monthStart));

    const cells = [];
    let day = startDate;

    while (day <= endDate) {
      const cloneDay = day;
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      cells.push(
        <button
          key={day.toString()}
          type="button"
          aria-pressed={!!isSelected}
          className={cn(
            cellBase,
            isSelected
              ? 'bg-primary text-on-primary font-semibold'
              : 'text-text-primary hover:bg-primary-soft',
            !isCurrentMonth && 'text-text-faint',
            isToday &&
              !isSelected &&
              'border-primary text-primary border font-semibold'
          )}
          onClick={() => {
            onChange(format(cloneDay, 'yyyy-MM-dd'));
            setOpen(false);
          }}
        >
          {format(day, 'd')}
        </button>
      );
      day = addDays(day, 1);
    }

    return <div className="gap-xxs px-xs pb-xs grid grid-cols-7">{cells}</div>;
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className="w-full cursor-pointer disabled:cursor-not-allowed"
        >
          <div
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'default' }),
              'w-full justify-between text-left font-normal',
              open && 'border-primary bg-primary-soft',
              error && 'border-danger',
              className
            )}
          >
            <span
              className={cn('truncate', !selectedDate && 'text-text-muted')}
            >
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
            </span>
            <CalendarIcon className="size-4 shrink-0" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[336px] gap-0 p-0" align="start">
          {renderHeader()}
          {view === 'days' && (
            <>
              {renderWeekdays()}
              {renderCells()}
            </>
          )}
          {view === 'months' && renderMonths()}
          {view === 'years' && renderYears()}
          <div className="border-border-default gap-xs p-xs flex border-t">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              Xóa ngày
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              onClick={() => {
                onChange(format(new Date(), 'yyyy-MM-dd'));
                setOpen(false);
              }}
            >
              Hôm nay
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
