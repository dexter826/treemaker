"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import TreeClient from '../../../components/tree/tree-client';
import { toast } from 'sonner';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

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
          setError('Không tìm thấy cây gia phả hoặc liên kết không hợp lệ.');
        } else {
          setTreeId(data.id);
        }
      } catch (err: any) {
        setError('Lỗi khi tải dữ liệu chia sẻ');
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
        <LoadingSpinner size="lg" text="Đang truy xuất hệ thống..." />
      </div>
    );
  }

  return <TreeClient treeId={treeId} />;
}
