import TreeClient from '../../../components/tree/tree-client';

export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TreeClient treeId={resolvedParams.id} />;
}
