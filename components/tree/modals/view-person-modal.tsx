"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { X, ArrowLeft } from 'lucide-react';
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
        className="sm:max-w-[380px] overflow-hidden flex flex-col h-[440px]"
      >
        {!showFullBio && (
          <DialogClose render={<Button variant="outline" size="icon-xs" className="absolute top-3 right-3 z-50 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]" />}>
            <X size={14} strokeWidth={3} />
          </DialogClose>
        )}

        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: genderColor }} />

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 p-0">
          {showFullBio ? (
            /* Chi tiết tiểu sử */
            <div className="flex flex-col h-full">
              <div className="px-5 py-3 border-b-2 border-foreground bg-primary/5 flex items-center justify-between shrink-0">
                <span className="font-serif font-black text-sm uppercase tracking-tight">Tiểu sử chi tiết</span>
                <Button 
                  variant="outline" 
                  size="xs" 
                  onClick={() => setShowFullBio(false)}
                  className="h-8 px-2 text-[10px] bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] gap-1 font-bold"
                >
                  <ArrowLeft size={12} strokeWidth={3} />
                  QUAY LẠI
                </Button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium italic break-all">
                  {person.bio}
                </p>
              </div>
            </div>
          ) : (
            /* Thông tin tổng quát */
            <div className="flex flex-col h-full">
              <div className="border-b-2 border-foreground bg-primary/5 p-4 flex items-center gap-4 shrink-0 relative">
                <Avatar className="h-13 w-13 border-2 border-foreground rounded-none bg-background shadow-[3px_3px_0px_0px_var(--color-foreground)] shrink-0">
                  <AvatarImage src={person.avatar_url || ''} className="object-cover" />
                  <AvatarFallback className="rounded-none font-serif font-black text-xl" style={{ color: genderColor }}>
                    {person.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 pr-6">
                  <DialogTitle className="font-serif font-black text-lg tracking-tight leading-tight uppercase break-all">
                    {person.full_name}
                  </DialogTitle>
                  {person.nickname && (
                    <p className="text-xs font-medium text-muted-foreground italic truncate">
                      &quot;{person.nickname}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-4 pb-0 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <InfoItem label="Giới tính" value={isMale ? 'Nam' : 'Nữ'} />
                  <InfoItem label="Thứ tự" value={person.sibling_order ? `Con thứ ${person.sibling_order}` : '—'} />
                  <InfoItem label="Ngày sinh" value={person.birth_date ? format(new Date(person.birth_date), 'dd/MM/yyyy') : '—'} />
                  <InfoItem 
                    label="Quốc gia cư trú" 
                    value={person.country_code ? person.country_code.toUpperCase() : '—'} 
                    icon={person.country_code ? <Flag code={person.country_code} className="w-5 h-3.5 object-cover border border-foreground/20" /> : null}
                  />
                  {person.death_date && (
                    <InfoItem label="Ngày mất" value={format(new Date(person.death_date), 'dd/MM/yyyy')} isDestructive />
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t-2 border-foreground/10">
                  <InfoItem label="Địa chỉ" value={person.address || '—'} fullWidth />
                  <InfoItem label="Nghề nghiệp" value={person.occupation || '—'} fullWidth />
                  <div className="flex flex-col min-w-0 col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-0.5">Tiểu sử</span>
                    <div className="relative min-w-0">
                      <p className="text-sm font-normal leading-relaxed text-muted-foreground/90 line-clamp-3 whitespace-pre-wrap italic break-all">
                        {person.bio || '—'}
                      </p>
                      {person.bio && person.bio.length > 100 && (
                        <button 
                          onClick={() => setShowFullBio(true)}
                          className="text-[10px] font-black uppercase text-primary mt-1 hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer"
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

function InfoItem({ label, value, icon, fullWidth = false, isDestructive = false }: InfoItemProps) {
  return (
    <div className={cn(
        "flex flex-col min-w-0",
        fullWidth ? "col-span-2" : "col-span-1"
      )}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-0.5 truncate">
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        {icon && <div className="shrink-0">{icon}</div>}
        <p className={cn(
          "text-sm font-bold text-foreground break-all min-w-0",
          isDestructive && "text-destructive"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
