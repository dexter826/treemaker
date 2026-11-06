import { useCallback, useState } from 'react';
import { Connection, Edge } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { personService } from '@/features/person';
import { toast } from 'sonner';
import { TreeEdgeMeta } from '../utils/layout';

const isTreeEdgeMeta = (data: unknown): data is TreeEdgeMeta => {
  const kind = (data as { kind?: unknown } | undefined)?.kind;
  return kind === 'parent' || kind === 'spouse' || kind === 'couple-child';
};

export function useTreeConnections(
  persons: Person[],
  isReadOnly: boolean,
  updatePerson: (person: Person) => void,
  setEdges: (updater: (eds: Edge[]) => Edge[]) => void
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
    [isReadOnly]
  );

  const severEdge = async (edge: Edge): Promise<void> => {
    const meta = edge.data as TreeEdgeMeta;

    if (meta.kind === 'spouse') {
      const [personId, spouseId] = meta.personIds;
      await personService.unlinkRelation('spouse', personId, spouseId);
      removeRelationship(personId, spouseId);
      return;
    }

    if (meta.kind === 'parent') {
      await personService.unlinkRelation(meta.role, meta.personId);
      const person = persons.find((p) => p.id === meta.personId);
      if (person)
        updatePerson({
          ...person,
          [meta.role === 'father' ? 'father_id' : 'mother_id']: null,
        });
      return;
    }

    // Node hôn phối nối người con với cả cặp, nên một edge ở đây cắt
    // cả liên kết cha lẫn liên kết mẹ.
    await personService.unlinkRelation('father', meta.personId);
    await personService.unlinkRelation('mother', meta.personId);
    const person = persons.find((p) => p.id === meta.personId);
    if (person) updatePerson({ ...person, father_id: null, mother_id: null });
  };

  const confirmDelete = async () => {
    if (!edgeToDelete) return;
    setIsConfirmOpen(false);

    if (edgeToDelete.some((edge) => !isTreeEdgeMeta(edge.data))) {
      toast.error('Không nhận diện được loại kết nối, nên chưa xoá gì.');
      setEdgeToDelete(null);
      return;
    }

    for (const edge of edgeToDelete) {
      try {
        await severEdge(edge);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : 'Không thể xóa kết nối.'
        );
        setEdgeToDelete(null);
        return;
      }
    }

    setEdges((eds) =>
      eds.filter((e) => !edgeToDelete.some((del) => del.id === e.id))
    );
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
          const relationType =
            sourcePerson.gender === 'male' ? 'father' : 'mother';
          await personService.linkRelation(relationType, target, source);
          updatePerson({
            ...targetPerson,
            [relationType === 'father' ? 'father_id' : 'mother_id']: source,
          });
          toast.success(
            `Đã gán ${relationType === 'father' ? 'Cha' : 'Mẹ'}: ${sourcePerson.full_name}`
          );
        } else if (
          (sourceHandle === 'left' || sourceHandle === 'right') &&
          (targetHandle === 'left' || targetHandle === 'right')
        ) {
          const rel = await personService.linkRelation(
            'spouse',
            source,
            target
          );
          if (rel) addRelationship(rel);
          toast.success('Đã kết nối Vợ/Chồng.');
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : 'Lỗi khi tạo kết nối.'
        );
      }
    },
    [persons, isReadOnly, updatePerson, addRelationship]
  );

  return {
    onConnect,
    onBeforeDelete,
    confirmDelete,
    isConfirmOpen,
    setIsConfirmOpen,
  };
}
