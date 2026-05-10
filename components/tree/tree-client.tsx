"use client";

import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { FamilyTreeCanvas } from './canvas/family-tree-canvas';
import { TreeToolbar } from './parts/tree-toolbar';
import { Sidebar } from './parts/sidebar';
import { ViewPersonModal } from './modals/view-person-modal';
import { personService } from '../../lib/services/person.service';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';
import { TreeChatbot } from './parts/tree-chatbot';

export default function TreeClient({ treeId }: { treeId: string }) {
  const setCurrentTree = useStore((state) => state.setCurrentTree);
  const setPersons = useStore((state) => state.setPersons);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const setIsReadOnly = useStore((state) => state.setIsReadOnly);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const setShowCardActions = useStore((state) => state.setShowCardActions);
  const isLoading = useStore((state) => state.isLoading);
  const setRelationships = useStore((state) => state.setRelationships);

  useEffect(() => {
    const loadTree = async () => {
      setIsLoading(true);
      setSelectedPersonId(null);
      setViewPersonId(null);
      setShowCardActions(null);

      try {
        const { tree, persons, relationships } = await personService.getTreeData(treeId);
        setCurrentTree(tree);
        setPersons(persons);
        setRelationships(relationships);

        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        setIsReadOnly(currentUserId !== tree.owner_id);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Lỗi truy xuất hệ thống.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTree();
  }, [
    treeId,
    setCurrentTree,
    setPersons,
    setIsLoading,
    setIsReadOnly,
    setSelectedPersonId,
    setViewPersonId,
    setShowCardActions,
  ]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Đang tải cây gia phả..." />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <ReactFlowProvider>
        <TreeToolbar />
        <FamilyTreeCanvas />
        <Sidebar />
        <ViewPersonModal />
        <TreeChatbot />
      </ReactFlowProvider>
    </div>
  );
}
