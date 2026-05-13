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
import { SplashScreen } from '../ui/splash-screen';
import { TreeChatbot } from './parts/tree-chatbot';
import { LegacyBookTemplate } from './parts/legacy-book-template';

// Thành phần Client quản lý tương tác cây gia phả.
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
  const currentTree = useStore((state) => state.currentTree);
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);

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
        const isOwner = currentUserId === tree.owner_id;
        const canEdit = tree.share_permission === 'edit';
        setIsReadOnly(!isOwner && !canEdit);


      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Lỗi truy xuất hệ thống.';
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTree();
  }, [treeId, setCurrentTree, setIsReadOnly, setIsLoading, setPersons, setRelationships, setSelectedPersonId, setShowCardActions, setViewPersonId]);

  return (
    <>
      <SplashScreen isVisible={isLoading} />
      
      {!isLoading && (
        <div className="w-full h-dvh flex relative overflow-hidden bg-background">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <ReactFlowProvider>
            <TreeToolbar />
            <FamilyTreeCanvas />
            <Sidebar />
            <ViewPersonModal />
            <TreeChatbot />
            {currentTree && <LegacyBookTemplate tree={currentTree} persons={persons} relationships={relationships} />}
          </ReactFlowProvider>
        </div>
      )}
    </>
  );
}
