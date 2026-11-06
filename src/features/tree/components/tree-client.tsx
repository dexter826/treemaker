'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from '@/lib/store';
import { FamilyTreeCanvas } from './canvas/family-tree-canvas';
import { TreeToolbar } from './parts/tree-toolbar';
import { Sidebar } from './parts/sidebar';
import { ViewPersonModal } from '@/features/person';
import { treeService } from '../services/tree.service';
import { authService } from '@/features/auth';
import { toast } from 'sonner';
import { LegacyBookTemplate } from './parts/legacy-book-template';
import { Skeleton } from '@/components/ui/skeleton';

export default function TreeClient({ treeId }: { treeId: string }) {
  const setCurrentTree = useStore((state) => state.setCurrentTree);
  const setPersons = useStore((state) => state.setPersons);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const setIsReadOnly = useStore((state) => state.setIsReadOnly);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const isLoading = useStore((state) => state.isLoading);
  const setRelationships = useStore((state) => state.setRelationships);
  const currentTree = useStore((state) => state.currentTree);
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);

  useEffect(() => {
    const loadTree = async () => {
      setIsLoading(true);
      setSelectedPersonId(null);
      setViewPersonId(null);

      try {
        const { tree, persons, relationships } =
          await treeService.getTreeData(treeId);
        setCurrentTree(tree);
        setPersons(persons);
        setRelationships(relationships);

        const session = await authService.getSession();
        const currentUserId = session?.user?.id;
        const isOwner = currentUserId === tree.owner_id;
        const canEdit = tree.share_permission === 'edit';
        setIsReadOnly(!isOwner && !canEdit);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Lỗi truy xuất hệ thống.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTree();
  }, [
    treeId,
    setCurrentTree,
    setIsReadOnly,
    setIsLoading,
    setPersons,
    setRelationships,
    setSelectedPersonId,
    setViewPersonId,
  ]);

  if (isLoading) {
    return (
      <div className="bg-background flex h-dvh w-full flex-col gap-4 p-4">
        <Skeleton className="h-12 w-72 self-center" />
        <div className="grid flex-1 grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="rounded-node h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-dvh w-full overflow-hidden">
      <ReactFlowProvider>
        <div className="relative flex min-w-0 flex-1">
          <div className="relative min-w-0 flex-1">
            <TreeToolbar />
            <FamilyTreeCanvas />
          </div>
          <Sidebar />
        </div>
        <ViewPersonModal />
        {currentTree && (
          <LegacyBookTemplate
            tree={currentTree}
            persons={persons}
            relationships={relationships}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
}
