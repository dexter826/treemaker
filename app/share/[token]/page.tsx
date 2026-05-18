import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { treeService } from '../../../lib/services/tree.service';
import { ShareTreeClient } from './share-tree-client';

// Tạo siêu dữ liệu cho trang chia sẻ.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const tree = await treeService.getByShareToken(token);

  const title = tree ? `${tree.name} | TreeMaker` : 'TreeMaker | Xây dựng cây gia phả trực tuyến';
  const description = tree ? `Khám phá cây gia phả ${tree.name} trên TreeMaker.` : 'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-image.png'],
    },
    twitter: {
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const treeId = await treeService.getByShareToken(token);
  if (!treeId) notFound();

  return <ShareTreeClient token={token} />;
}
