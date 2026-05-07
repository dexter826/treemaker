"use client"
import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { FamilyTreeCanvas } from './family-tree-canvas';
import { TreeToolbar } from './tree-toolbar';
import { Sidebar } from './sidebar';
import { ViewPersonModal } from './view-person-modal';
import { treeService } from '../../lib/services/tree.service';
import { toast } from 'sonner';
import { LoadingSpinner } from '../ui/loading-spinner';

export default function TreeClient({ treeId }: { treeId: string }) {
  const setCurrentTree = useStore(state => state.setCurrentTree);
  const setPersons = useStore(state => state.setPersons);
  const setIsLoading = useStore(state => state.setIsLoading);
  const setIsReadOnly = useStore(state => state.setIsReadOnly);
  const isLoading = useStore(state => state.isLoading);

  useEffect(() => {
    async function loadTree() {
      setIsLoading(true);
      try {
        const { tree, persons } = await treeService.loadWithPersons(treeId);
        
        setCurrentTree(tree);
        setPersons(persons);
        
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        
        if (currentUserId !== tree.owner_id) {
          setIsReadOnly(true);
        } else {
          setIsReadOnly(false);
        }

      } catch (error: any) {
        toast.error('Lỗi truy xuất hệ thống: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTree();
  }, [treeId, setCurrentTree, setPersons, setIsLoading, setIsReadOnly]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Đang truy xuất hệ thống..." />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex relative overflow-hidden bg-background">
      <ReactFlowProvider>
        <TreeToolbar />
        <FamilyTreeCanvas />
        <Sidebar />
        <ViewPersonModal />
      </ReactFlowProvider>
    </div>
  );
}
