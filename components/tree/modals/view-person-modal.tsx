"use client";

import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export function ViewPersonModal() {
  const viewPersonId = useStore((state) => state.viewPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const persons = useStore((state) => state.persons);

  const person = persons.find((p) => p.id === viewPersonId);
  if (!person) return null;

  return (
    <Dialog open={!!viewPersonId} onOpenChange={() => setViewPersonId(null)}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
        <div className="border-b-2 border-foreground bg-primary/5 p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-foreground rounded-none">
            <AvatarImage src={person.avatar_url || ''} />
            <AvatarFallback className="rounded-none bg-background font-serif font-black text-xl">
              {person.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <DialogTitle className="font-serif font-black text-xl tracking-wide pr-8">{person.full_name}</DialogTitle>
        </div>

        <div className="p-4 space-y-3">
          <InfoRow label="Giới tính" value={person.gender === 'male' ? 'Nam' : 'Nữ'} />
          <InfoRow label="Thứ tự sinh" value={person.sibling_order?.toString() || '0'} />
          <InfoRow label="Tên gọi khác" value={person.nickname || '—'} />
          <InfoRow label="Ngày sinh" value={person.birth_date ? format(new Date(person.birth_date), 'dd/MM/yyyy') : '—'} />
          {person.death_date && <InfoRow label="Ngày mất" value={format(new Date(person.death_date), 'dd/MM/yyyy')} />}
          <InfoRow label="Địa chỉ" value={person.address || '—'} />
          <InfoRow label="Nghề nghiệp" value={person.occupation || '—'} />
          <InfoRow label="Tiểu sử" value={person.bio || '—'} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs font-semibold text-muted-foreground tracking-wide shrink-0 w-24">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
