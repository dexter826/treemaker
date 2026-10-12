'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeClient, treeService } from '@/features/tree';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Lock, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { FamilyTree } from '@/types';
import { toast } from 'sonner';
import { OTPInput } from '@/components/ui/otp-input';

export function ShareTreeClient({ token }: { token: string }) {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await treeService.getByShareToken(token);
        if (!data) {
          setError('không tìm thấy dữ liệu cây gia phả.');
          return;
        }

        if (data.visibility === 'private') {
          setError('Cây gia phả này đang ở chế độ riêng tư.');
          return;
        }

        setTree(data);
        if (!data.share_password) {
          setIsAuthorized(true);
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const handlePasswordSubmit = (currentPassword: string = password) => {
    if (tree?.share_password === currentPassword) {
      setIsAuthorized(true);
      toast.success('Xác thực thành công.');
    } else if (currentPassword.length === 4) {
      toast.error('Mật khẩu không chính xác.');
    }
  };

  // Tự động kiểm tra khi nhập đủ 4 chữ số.
  const handleOTPChange = (val: string) => {
    setPassword(val);
    if (val.length === 4) {
      handlePasswordSubmit(val);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex h-screen w-full flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 border-destructive mb-6 flex h-16 w-16 items-center justify-center border-2">
          <ShieldAlert className="text-destructive size-8" />
        </div>
        <h1 className="mb-2 font-serif text-2xl font-black tracking-tight uppercase">
          Truy Cập Bị Từ Chối
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xs text-sm font-medium">
          {error}
        </p>
        <Link href="/">
          <Button
            variant="outline"
            className="shadow-brutal-md h-12 border-2 px-8"
          >
            <Home className="mr-2 size-4" />
            Về Trang Chủ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isAuthorized ? (
        <motion.div
          key="password-gate"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background flex h-screen w-full items-center justify-center p-6"
        >
          <div className="border-foreground bg-background shadow-brutal-lg w-full max-w-sm border-2 p-8">
            <div className="mb-6 flex justify-center">
              <div className="bg-primary/10 border-primary flex size-12 items-center justify-center border-2">
                <Lock className="text-primary size-6" />
              </div>
            </div>

            <h2 className="mb-1 text-center font-serif text-xl font-black tracking-tight uppercase">
              Yêu Cầu Mật Khẩu
            </h2>
            <p className="text-muted-foreground mb-8 text-center text-[10px] font-bold tracking-widest uppercase">
              Cây gia phả này được bảo vệ
            </p>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <OTPInput value={password} onChange={handleOTPChange} />
              </div>

              <Button
                onClick={() => handlePasswordSubmit()}
                className="border-foreground shadow-brutal-md h-12 w-full border-2 font-black tracking-widest uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                disabled={password.length < 4}
              >
                Xác Thực Ngay
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="tree-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen w-full"
        >
          {tree && <TreeClient treeId={tree.id} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
