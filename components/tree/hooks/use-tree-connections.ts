import { useCallback, useState } from 'react';
import { Connection, Edge } from '@xyflow/react';
import { Person } from '@/types';
import { personService } from '@/lib/services/person.service';
import { toast } from 'sonner';

// Xử lý logic thiết lập và hủy bỏ quan hệ gia đình.
export function useTreeConnections(
  persons: Person[], 
  isReadOnly: boolean, 
  updatePerson: (person: Person) => void,
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void
) {
  const [edgeToDelete, setEdgeToDelete] = useState<Edge[] | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onBeforeDelete = useCallback(async ({ edges: deletedEdges }: { edges: Edge[] }) => {
    if (isReadOnly) return false;
    setEdgeToDelete(deletedEdges);
    setIsConfirmOpen(true);
    return false;
  }, [isReadOnly]);

  const confirmDelete = async () => {
    if (!edgeToDelete) return;
    
    setIsConfirmOpen(false);
    
    for (const edge of edgeToDelete) {
      const parts = edge.id.split(':');
      const type = parts[1];
      
      try {
        if (type === 'father') {
          const personId = parts[3];
          await personService.removeFather(personId);
          const person = persons.find(p => p.id === personId);
          if (person) updatePerson({ ...person, father_id: null });
        } else if (type === 'mother') {
          const personId = parts[3];
          await personService.removeMother(personId);
          const person = persons.find(p => p.id === personId);
          if (person) updatePerson({ ...person, mother_id: null });
        } else if (type === 'spouse') {
          const p1Id = parts[2];
          const p2Id = parts[3];
          await personService.removeSpouse(p1Id, p2Id);
          const p1 = persons.find(p => p.id === p1Id);
          const p2 = persons.find(p => p.id === p2Id);
          if (p1) updatePerson({ ...p1, spouse_id: null });
          if (p2) updatePerson({ ...p2, spouse_id: null });
        }
      } catch (error) {
        console.error('Lỗi khi xóa kết nối:', error);
        toast.error('Không thể xóa kết nối');
        setEdgeToDelete(null);
        return;
      }
    }

    setEdges((eds) => eds.filter((e) => !edgeToDelete.some((del) => del.id === e.id)));
    toast.success('Đã xóa kết nối thành công');
    setEdgeToDelete(null);
  };

  const onConnect = useCallback(async (params: Connection) => {
    if (isReadOnly) return;
    
    const { source, target, sourceHandle, targetHandle } = params;
    if (!source || !target || source === target) return;

    const sourcePerson = persons.find(p => p.id === source);
    const targetPerson = persons.find(p => p.id === target);

    if (!sourcePerson || !targetPerson) return;

    try {
      if (sourceHandle === 'bottom' && targetHandle === 'top') {
        if (sourcePerson.gender === 'male') {
          await personService.addFather(target, source);
          updatePerson({ ...targetPerson, father_id: source });
          toast.success(`Gắn quan hệ Cha: ${sourcePerson.full_name}`);
        } else if (sourcePerson.gender === 'female') {
          await personService.addMother(target, source);
          updatePerson({ ...targetPerson, mother_id: source });
          toast.success(`Gắn quan hệ Mẹ: ${sourcePerson.full_name}`);
        } else {
          toast.error('Giới tính cha/mẹ chưa xác định');
        }
      } else if ((sourceHandle === 'left' || sourceHandle === 'right') && 
                 (targetHandle === 'left' || targetHandle === 'right')) {
        await personService.addSpouse(source, target);
        updatePerson({ ...sourcePerson, spouse_id: target });
        updatePerson({ ...targetPerson, spouse_id: source });
        toast.success('Đã kết nối Vợ/Chồng');
      }
    } catch (error) {
      toast.error('Lỗi khi tạo kết nối');
    }
  }, [persons, isReadOnly, updatePerson]);

  return {
    onConnect,
    onBeforeDelete,
    confirmDelete,
    isConfirmOpen,
    setIsConfirmOpen
  };
}
