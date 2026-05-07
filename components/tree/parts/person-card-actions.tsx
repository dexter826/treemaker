"use client"
import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Eye } from 'lucide-react';

interface PersonCardActionsProps {
  person: Person;
  onClose: () => void;
}

export function PersonCardActions({ person, onClose }: PersonCardActionsProps) {
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);

  const handleEdit = () => {
    setSelectedPersonId(person.id);
    onClose();
  };

  const handleView = () => {
    setViewPersonId(person.id);
    onClose();
  };

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex gap-3">
        {!isReadOnly && (
          <Button 
            onClick={handleEdit}
            className="flex items-center gap-2 h-10 px-4 rounded-none border-2 border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-xs">Sửa</span>
          </Button>
        )}
        
        <Button 
          onClick={handleView}
          className="flex items-center gap-2 h-10 px-4 rounded-none border-2 border-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span className="font-bold uppercase tracking-widest text-xs">Xem</span>
        </Button>
      </div>
    </div>
  );
}