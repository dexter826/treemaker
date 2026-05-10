import { ShareTreeClient } from './share-tree-client';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  return <ShareTreeClient token={resolvedParams.token} />;
}
