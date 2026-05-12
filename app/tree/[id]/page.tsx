import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TreeClient from '@/components/tree/tree-client';

// Chi tiết cây gia phả (Server Component).
export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  try {

    const { data: tree, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tree) {
      notFound();
    }
  } catch {
    notFound();
  }

  return <TreeClient treeId={id} />;
}
