'use client';

import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Trash2, Loader2 } from 'lucide-react';
import { personService } from '../services/person.service';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { isDeceased } from '../utils/person-utils';

interface PersonCardActionsProps {
  person: Person;
  onClose: () => void;
}

// Các thao tác nhanh trên thẻ cá nhân.
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
      const message =
        error instanceof Error ? error.message : 'Lỗi khi xóa hồ sơ.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const isSelected = useStore((state) => state.selectedPersonId === person.id);
  const deceased = isDeceased(person);

  return (
    <div
      className={cn(
        'bg-background export-exclude absolute inset-0 z-50 flex [transform:rotateY(180deg)] items-center justify-center border-2 [backface-visibility:hidden]',
        isSelected
          ? 'border-primary shadow-brutal-primary-lg'
          : deceased
            ? 'border-deceased-border bg-deceased-bg shadow-brutal-sm opacity-95'
            : 'border-foreground shadow-brutal-lg'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="flex flex-col gap-4">
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
          <Eye className="h-5 w-5" />
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
              <Pencil className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
              }}
              size="icon"
              effect="raised"
              title="Xóa hồ sơ"
              className="h-12 w-12"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader variant="destructive">
            <DialogTitle>Xóa hồ sơ</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <p className="text-sm leading-relaxed font-medium">
              Bạn có chắc chắn muốn xóa hồ sơ của{' '}
              <span className="font-bold">{person.full_name}</span> không?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setIsConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="h-12 flex-1"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
