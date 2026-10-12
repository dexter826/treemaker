'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { X, ArrowLeft, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Flag from 'react-world-flags';

export function ViewPersonModal() {
  const viewPersonId = useStore((state) => state.viewPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const persons = useStore((state) => state.persons);

  const [showFullBio, setShowFullBio] = useState(false);

  const person = persons.find((p) => p.id === viewPersonId);
  if (!person) return null;

  const isMale = person.gender === 'male';
  const genderColor = isMale ? 'var(--color-male)' : 'var(--color-female)';

  return (
    <Dialog
      open={!!viewPersonId}
      onOpenChange={(open) => {
        if (!open) {
          setViewPersonId(null);
          setShowFullBio(false);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[440px] flex-col overflow-hidden sm:max-w-[380px]"
      >
        {!showFullBio && (
          <DialogClose
            render={
              <Button
                variant="outline"
                size="icon-xs"
                className="bg-background border-foreground shadow-brutal-sm absolute top-3 right-3 z-50 border-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              />
            }
          >
            <X size={14} strokeWidth={3} />
          </DialogClose>
        )}

        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: genderColor }}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          {showFullBio ? (
            <div className="flex h-full flex-col">
              <div className="border-foreground bg-primary/5 flex shrink-0 items-center justify-between border-b-2 px-5 py-3">
                <span className="font-serif text-sm font-black tracking-tight uppercase">
                  Tiểu sử chi tiết
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setShowFullBio(false)}
                  className="bg-background border-foreground shadow-brutal-sm h-8 gap-1 border-2 px-2 text-[10px] font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <ArrowLeft size={12} strokeWidth={3} />
                  QUAY LẠI
                </Button>
              </div>
              <div className="min-w-0 flex-1 overflow-y-auto p-6">
                <p className="text-foreground text-sm leading-relaxed font-medium break-all whitespace-pre-wrap italic">
                  {person.bio}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-foreground bg-primary/5 relative flex shrink-0 items-center gap-4 border-b-2 p-4">
                <Avatar className="border-foreground bg-background shadow-brutal-sm h-13 w-13 shrink-0 rounded-none border-2">
                  <AvatarImage
                    src={person.avatar_url || ''}
                    className="object-cover"
                  />
                  <AvatarFallback
                    className="rounded-none font-serif text-xl font-black"
                    style={{ color: genderColor }}
                  >
                    {person.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 pr-6">
                  <DialogTitle className="font-serif text-lg leading-tight font-black tracking-tight break-all uppercase">
                    {person.full_name}
                  </DialogTitle>
                  {person.nickname && (
                    <p className="text-muted-foreground truncate text-xs font-medium italic">
                      &quot;{person.nickname}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-4 pb-0">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <InfoItem label="Giới tính" value={isMale ? 'Nam' : 'Nữ'} />
                  <InfoItem
                    label="Thứ tự"
                    value={
                      person.sibling_order
                        ? `Con thứ ${person.sibling_order}`
                        : '—'
                    }
                  />
                  <InfoItem
                    label="Ngày sinh"
                    value={
                      person.birth_date
                        ? format(new Date(person.birth_date), 'dd/MM/yyyy')
                        : '—'
                    }
                  />
                  <InfoItem
                    label="Quốc gia cư trú"
                    value={
                      person.country_code
                        ? person.country_code.toUpperCase()
                        : '—'
                    }
                    icon={
                      person.country_code ? (
                        <Flag
                          code={person.country_code}
                          className="border-foreground/20 h-3.5 w-5 border object-cover"
                        />
                      ) : null
                    }
                  />
                  {person.death_date && (
                    <InfoItem
                      label="Ngày mất"
                      value={format(new Date(person.death_date), 'dd/MM/yyyy')}
                      isDestructive
                    />
                  )}
                </div>

                <div className="border-foreground/10 space-y-2 border-t-2 pt-3">
                  <div className="flex items-start justify-between gap-4">
                    <InfoItem
                      label="Địa chỉ"
                      value={person.address || '—'}
                      fullWidth
                    />
                    {person.address && (
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => {
                          if (person.address) {
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(person.address)}`,
                              '_blank'
                            );
                          }
                        }}
                        className="bg-background border-foreground shadow-brutal-sm mt-4 shrink-0 border-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        title="Xem trên Google Maps"
                      >
                        <Map size={12} strokeWidth={3} />
                      </Button>
                    )}
                  </div>
                  <InfoItem
                    label="Nghề nghiệp"
                    value={person.occupation || '—'}
                    fullWidth
                  />
                  <div className="col-span-2 flex min-w-0 flex-col">
                    <span className="text-muted-foreground/80 mb-0.5 text-[9px] font-bold tracking-widest uppercase">
                      Tiểu sử
                    </span>
                    <div className="relative min-w-0">
                      <p className="text-muted-foreground/90 line-clamp-3 text-sm leading-relaxed font-normal break-all whitespace-pre-wrap italic">
                        {person.bio || '—'}
                      </p>
                      {person.bio && person.bio.length > 100 && (
                        <button
                          onClick={() => setShowFullBio(true)}
                          className="text-primary mt-1 flex cursor-pointer items-center gap-1 text-[10px] font-black uppercase underline-offset-2 hover:underline"
                        >
                          [ Xem thêm tiểu sử ]
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  isDestructive?: boolean;
}

function InfoItem({
  label,
  value,
  icon,
  fullWidth = false,
  isDestructive = false,
}: InfoItemProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        fullWidth ? 'col-span-2' : 'col-span-1'
      )}
    >
      <span className="text-muted-foreground/80 mb-0.5 truncate text-[9px] font-bold tracking-widest uppercase">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        {icon && <div className="shrink-0">{icon}</div>}
        <p
          className={cn(
            'text-foreground min-w-0 text-sm font-bold break-all',
            isDestructive && 'text-destructive'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
