"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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



  return (
    <AnimatePresence mode="wait">
      {!treeId ? (
        <motion.div
          key="loading"
          className="w-full h-screen flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoadingSpinner size="lg" text="Đang tải..." />
        </motion.div>
      ) : (
        <motion.div
          key="tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TreeClient treeId={treeId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
