"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TreeClient from '../../../components/tree/tree-client';
import { treeService } from '../../../lib/services/tree.service';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
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
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 flex items-center justify-center mb-6 border-2 border-destructive">
          <ShieldAlert className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-serif font-black uppercase mb-2 tracking-tight">Truy Cập Bị Từ Chối</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8 font-medium">
          {error}
        </p>
        <Link href="/">
          <Button variant="outline" className="h-12 px-8 border-2 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
            <Home className="size-4 mr-2" />
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
          className="w-full h-screen flex items-center justify-center bg-background p-6"
        >
          <div className="w-full max-w-sm border-2 border-foreground p-8 bg-background shadow-[8px_8px_0px_0px_var(--color-foreground)]">
            <div className="flex justify-center mb-6">
              <div className="size-12 bg-primary/10 flex items-center justify-center border-2 border-primary">
                <Lock className="size-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-serif font-black text-center uppercase mb-1 tracking-tight">Yêu Cầu Mật Khẩu</h2>
            <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest mb-8">
              Cây gia phả này được bảo vệ
            </p>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <OTPInput
                  value={password}
                  onChange={handleOTPChange}
                />
              </div>
              
              <Button 
                onClick={() => handlePasswordSubmit()} 
                className="w-full h-12 font-black uppercase tracking-widest border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                disabled={password.length < 4}
              >
                Xác Thực Ngay
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="tree-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-screen"
        >
          {tree && <TreeClient treeId={tree.id} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
