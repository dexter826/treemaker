import { notFound } from 'next/navigation';
import { treeService } from '../../../lib/services/tree.service';
import { ShareTreeClient } from './share-tree-client';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const treeId = await treeService.getByShareToken(token);
  if (!treeId) notFound();

  return <ShareTreeClient token={token} />;
}
