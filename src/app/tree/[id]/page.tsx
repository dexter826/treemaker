import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TreeClient, treeService } from '@/features/tree';

// Chi tiết cây gia phả (Server Component).
export default async function TreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await treeService.getById(id, await createClient());
  } catch {
    notFound();
  }

  return <TreeClient treeId={id} />;
}
