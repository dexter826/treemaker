"use client"
import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function ViewPersonModal() {
  const viewPersonId = useStore((state) => state.viewPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const persons = useStore((state) => state.persons);

  const person = persons.find(p => p.id === viewPersonId);

  if (!person) return null;

  const handleClose = () => {
    setViewPersonId(null);
  };

  return (
    <Dialog open={!!viewPersonId} onOpenChange={handleClose}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
        <div className="border-b-2 border-foreground bg-primary/5 p-4">
          <DialogTitle className="font-serif font-black text-xl uppercase tracking-widest pr-8">
            {person.full_name}
          </DialogTitle>
        </div>

        <div className="p-4 space-y-3">
          <InfoRow label="Giới tính" value={person.gender === 'male' ? 'Nam' : person.gender === 'female' ? 'Nữ' : 'Khác'} />
          <InfoRow label="Năm sinh" value={person.birth_date ? new Date(person.birth_date).getFullYear().toString() : '—'} />
          {person.death_date && <InfoRow label="Năm mất" value={new Date(person.death_date).getFullYear().toString()} />}
          <InfoRow label="Địa chỉ" value={person.address || '—'} />
          <InfoRow label="Nghề nghiệp" value={person.occupation || '—'} />
          <InfoRow label="Tiểu sử" value={person.bio || '—'} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0 w-20">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}