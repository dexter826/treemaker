"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TreeClient from '../../../components/tree/tree-client';
import { treeService } from '../../../lib/services/tree.service';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

export function ShareTreeClient({ token }: { token: string }) {
  const [treeId, setTreeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const resolvedTreeId = await treeService.getByShareToken(token);
        if (!resolvedTreeId) {
          setError('Không tìm thấy cây gia phả hoặc liên kết không hợp lệ.');
          return;
        }
        setTreeId(resolvedTreeId);
      } catch {
        setError('Lỗi khi tải dữ liệu chia sẻ.');
      }
    }

    load();
  }, [token]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full border-2 border-foreground bg-card p-8 text-center space-y-4 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
          <h1 className="font-serif font-black text-2xl uppercase tracking-wide">Liên kết không khả dụng</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
          <Link href="/">
            <Button className="w-full">Quay về trang chủ</Button>
          </Link>
        </div>
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
