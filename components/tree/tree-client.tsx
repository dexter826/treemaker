"use client"
import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from '../../lib/store';
import { FamilyTreeCanvas } from './family-tree-canvas';
import { TreeToolbar } from './tree-toolbar';
import { Sidebar } from './sidebar';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

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
        // Fetch Tree
        const { data: tree, error: treeError } = await supabase
          .from('family_trees')
          .select('*')
          .eq('id', treeId)
          .single();
          
        if (treeError) throw treeError;

        // Fetch Persons
        const { data: persons, error: personsError } = await supabase
          .from('persons')
          .select('*')
          .eq('tree_id', treeId);
          
        if (personsError) throw personsError;

        setCurrentTree(tree);
        setPersons(persons || []);
        
        // Determine if read only by checking owner vs current session
        const { data: { session } } = await supabase.auth.getSession();
        setIsReadOnly(session?.user?.id !== tree.owner_id);

      } catch (error: any) {
        toast.error('Failed to load family tree: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTree();
  }, [treeId, setCurrentTree, setPersons, setIsLoading, setIsReadOnly]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <p className="text-muted-foreground">Loading Family Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex relative overflow-hidden bg-background">
      <ReactFlowProvider>
        <TreeToolbar />
        <FamilyTreeCanvas />
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}
