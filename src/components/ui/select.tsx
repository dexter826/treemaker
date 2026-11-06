'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { buttonVariants } from './button';
import { cn, removeVietnameseTones } from '@/lib/utils';
import { ChevronDown, Check, Search } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Input } from './input';

export function Select({
  options,
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Chọn một tùy chọn',
  showSearch = false,
  error = false,
}: {
  options: { value: string; label: React.ReactNode; searchText?: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showSearch?: boolean;
  error?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) => {
      const searchStr =
        opt.searchText || (typeof opt.label === 'string' ? opt.label : '');
      const normalizedSearch = removeVietnameseTones(searchStr);
      const normalizedTerm = removeVietnameseTones(searchTerm);
      return normalizedSearch.includes(normalizedTerm);
    });
  }, [options, searchTerm]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchTerm('');
    }
    setOpen(isOpen);
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={handleOpenChange}>
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
              className={cn('truncate', !selectedOption && 'text-text-muted')}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--anchor-width) gap-0 overflow-hidden p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {showSearch && (
            <div className="border-border-default gap-xs p-xs flex shrink-0 items-center border-b">
              <Search className="text-text-muted size-4 shrink-0" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-body-sm h-9 border-0 bg-transparent px-0 focus-visible:ring-0"
              />
            </div>
          )}

          <ScrollArea className="max-h-[300px] flex-1">
            <div className="p-xxs flex flex-col">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    className={cn(
                      'gap-sm rounded-control px-sm py-xs text-body-sm flex cursor-pointer items-center justify-between text-left',
                      'text-text-primary hover:bg-primary-soft transition-colors',
                      value === option.value && 'bg-selected text-on-selected'
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="size-4 shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-text-secondary p-md text-caption text-center">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
