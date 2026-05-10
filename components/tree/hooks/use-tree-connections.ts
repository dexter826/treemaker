import { useCallback, useState } from 'react';
import { Connection, Edge } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { personService } from '@/lib/services/person.service';
import { toast } from 'sonner';

export function useTreeConnections(
  persons: Person[],
  isReadOnly: boolean,
  updatePerson: (person: Person) => void,
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void,
) {
  const addRelationship = useStore((state) => state.addRelationship);
  const removeRelationship = useStore((state) => state.removeRelationship);
  
  const [edgeToDelete, setEdgeToDelete] = useState<Edge[] | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onBeforeDelete = useCallback(
    async ({ edges: deletedEdges }: { edges: Edge[] }) => {
      if (isReadOnly) return false;
      setEdgeToDelete(deletedEdges);
      setIsConfirmOpen(true);
      return false;
    },
    [isReadOnly],
  );

  const confirmDelete = async () => {
    if (!edgeToDelete) return;
    setIsConfirmOpen(false);

    for (const edge of edgeToDelete) {
      const parts = edge.id.split(':');
      const type = parts[1];

      try {
        if (type === 'father') {
          const personId = parts[3];
          await personService.unlinkRelation('father', personId);
          const person = persons.find((p) => p.id === personId);
          if (person) updatePerson({ ...person, father_id: null });
        } else if (type === 'mother') {
          const personId = parts[3];
          await personService.unlinkRelation('mother', personId);
          const person = persons.find((p) => p.id === personId);
          if (person) updatePerson({ ...person, mother_id: null });
        } else if (type === 'spouse') {
          const p1Id = parts[2];
          const p2Id = parts[3];
          await personService.unlinkRelation('spouse', p1Id, p2Id);
          removeRelationship(p1Id, p2Id);
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Không thể xóa kết nối.');
        setEdgeToDelete(null);
        return;
      }
    }

    setEdges((eds) => eds.filter((e) => !edgeToDelete.some((del) => del.id === e.id)));
    toast.success('Đã xóa kết nối thành công.');
    setEdgeToDelete(null);
  };

  const onConnect = useCallback(
    async (params: Connection) => {
      if (isReadOnly) return;
      const { source, target, sourceHandle, targetHandle } = params;
      if (!source || !target || source === target) return;

      const sourcePerson = persons.find((p) => p.id === source);
      const targetPerson = persons.find((p) => p.id === target);
      if (!sourcePerson || !targetPerson) return;

      try {
        if (sourceHandle === 'bottom' && targetHandle === 'top') {
          const relationType = sourcePerson.gender === 'male' ? 'father' : 'mother';
          await personService.linkRelation(relationType, target, source);
          updatePerson({ 
            ...targetPerson, 
            [relationType === 'father' ? 'father_id' : 'mother_id']: source 
          });
          toast.success(`Đã gán ${relationType === 'father' ? 'Cha' : 'Mẹ'}: ${sourcePerson.full_name}`);
        } else if (
          (sourceHandle === 'left' || sourceHandle === 'right') &&
          (targetHandle === 'left' || targetHandle === 'right')
        ) {
          const rel = await personService.linkRelation('spouse', source, target);
          if (rel) addRelationship(rel);
          toast.success('Đã kết nối Vợ/Chồng.');
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Lỗi khi tạo kết nối.');
      }
    },
    [persons, isReadOnly, updatePerson, addRelationship],
  );

  return {
    onConnect,
    onBeforeDelete,
    confirmDelete,
    isConfirmOpen,
    setIsConfirmOpen,
  };
}
