"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import TreeClient from '../../../components/tree/tree-client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShareTreeClient({ token }: { token: string }) {
  const [treeId, setTreeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('family_trees')
          .select('id')
          .eq('share_token', token)
          .single();

        if (error || !data) {
          setError('Tree not found or invalid link.');
        } else {
          setTreeId(data.id);
        }
      } catch (err: any) {
        setError('Error loading shared tree');
      }
    }
    load();
  }, [token]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!treeId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <TreeClient treeId={treeId} />;
}
