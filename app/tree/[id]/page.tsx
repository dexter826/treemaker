import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TreeClient from '@/components/tree/tree-client';

/**
 * Trang chi tiết cây gia phả (Server Component)
 * Đã được bảo vệ bởi Middleware
 */
export default async function TreePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  try {
    // Sử dụng Server Client để fetch dữ liệu với đầy đủ quyền (session)
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
