import { notFound } from 'next/navigation';
import { treeService } from '../../../lib/services/tree.service';
import TreeClient from '../../../components/tree/tree-client';

export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const tree = await treeService.getById(id);
    if (!tree) notFound();
  } catch {
    notFound();
  }

  return <TreeClient treeId={id} />;
}
