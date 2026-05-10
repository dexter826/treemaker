"use client";

import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Trash2, Loader2 } from 'lucide-react';
import { personService } from '@/lib/services/person.service';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PersonCardActionsProps {
  person: Person;
  onClose: () => void;
}

export function PersonCardActions({ person, onClose }: PersonCardActionsProps) {
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const removePerson = useStore((state) => state.removePerson);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await personService.delete(person.id);
      removePerson(person.id);
      toast.success('Đã xóa hồ sơ.');
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi xóa hồ sơ.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm person-card-actions"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col gap-3">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setViewPersonId(person.id);
            onClose();
          }}
          size="icon"
          effect="raised"
          title="Xem chi tiết"
          className="h-12 w-12"
        >
          <Eye className="w-5 h-5" />
        </Button>

        {!isReadOnly && (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPersonId(person.id);
                onClose();
              }}
              size="icon"
              effect="raised"
              title="Chỉnh sửa"
              className="h-12 w-12"
            >
              <Pencil className="w-5 h-5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
              }}
              size="icon"
              effect="raised"
              title="Xóa hồ sơ"
              className="h-12 w-12"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">Xác Nhận Xóa</DialogTitle>
          </div>

          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ của <span className="font-bold">{person.full_name}</span> không?
            </p>
          </div>

          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 h-14 border-r-2 border-foreground" onClick={() => setIsConfirmOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" className="flex-1 h-14" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
