"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TreeClient from '../../../components/tree/tree-client';
import { treeService } from '../../../lib/services/tree.service';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

export function ShareTreeClient({ token }: { token: string }) {
  const [treeId, setTreeId] = useState<string | null>(null);


  useEffect(() => {
    async function load() {
      try {
        const resolvedTreeId = await treeService.getByShareToken(token);
        if (!resolvedTreeId) {
          console.error('Không tìm thấy dữ liệu.');
          return;
        }
        setTreeId(resolvedTreeId);
      } catch {
        console.error('Lỗi khi tải dữ liệu chia sẻ.');
      }
    }

    load();
  }, [token]);



  if (!treeId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return <TreeClient treeId={treeId} />;
}
