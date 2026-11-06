'use client';

import { useEffect, useState } from 'react';
import { TreeClient, treeService } from '@/features/tree';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Lock, Home } from 'lucide-react';
import Link from 'next/link';
import { FamilyTree } from '@/types';
import { toast } from 'sonner';
import { OTPInput } from '@/components/ui/otp-input';
import { useIsMobile } from '@/hooks/use-mobile';

export function ShareTreeClient({ token }: { token: string }) {
  const isMobile = useIsMobile();
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await treeService.getByShareToken(token);
        if (!data) {
          setError('Không tìm thấy gia phả này.');
          return;
        }

        if (data.visibility === 'private') {
          setError('Gia phả này đang để ở chế độ riêng tư.');
          return;
        }

        setTree(data);
        if (!data.share_password) {
          setIsAuthorized(true);
        }
      } catch (err) {
        setError('Không tải được gia phả. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const handleSubmit = (value: string) => {
    if (tree?.share_password === value) {
      setIsAuthorized(true);
      setOtpError(null);
      toast.success('Đã mở gia phả.');
      return;
    }
    if (value.length === 4) {
      setOtpError('Mật khẩu không đúng. Kiểm tra lại và nhập từ ô đầu tiên.');
      setPassword('');
      setAttempt((n) => n + 1);
    }
  };

  const handleOTPChange = (value: string) => {
    setPassword(value);
    setOtpError(null);
    handleSubmit(value);
  };

  if (loading) {
    return (
      <div className="bg-background p-md flex min-h-dvh items-center justify-center">
        <div className="border-border-default bg-surface rounded-card p-xl w-full max-w-sm border">
          <Skeleton className="rounded-control mx-auto size-12" />
          <Skeleton className="mt-md mx-auto h-5 w-40" />
          <Skeleton className="mt-xs mx-auto h-4 w-52" />
          <Skeleton className="mt-xl mx-auto h-14 w-52" />
          <Skeleton className="mt-lg rounded-control h-11 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background gap-md p-xl flex min-h-dvh flex-col items-center justify-center text-center">
        <div className="border-border bg-surface rounded-card flex size-14 items-center justify-center border">
          <ShieldAlert className="text-danger size-7" />
        </div>
        <h1 className="text-title-lg font-semibold">Không mở được gia phả</h1>
        <p className="text-text-secondary text-body-sm max-w-sm">{error}</p>
        <Link href="/login">
          <Button variant="secondary">
            <Home />
            Đăng nhập để xem gia phả của bạn
          </Button>
        </Link>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="bg-background p-md flex min-h-dvh items-center justify-center">
        <div className="border-border-default bg-surface rounded-card p-xl w-full max-w-sm border">
          <div className="mb-lg gap-xs flex flex-col items-center text-center">
            <div className="border-border bg-surface-elevated rounded-card flex size-12 items-center justify-center border">
              <Lock className="text-primary size-6" />
            </div>
            <h1 className="text-title-lg font-semibold">Nhập mật khẩu</h1>
            <p className="text-text-secondary text-caption">
              Gia phả này được bảo vệ bằng mật khẩu 4 chữ số.
            </p>
          </div>

          <OTPInput
            key={attempt}
            value={password}
            onChange={handleOTPChange}
            error={!!otpError}
          />

          {otpError && (
            <Alert variant="destructive" className="mt-md">
              <AlertDescription>{otpError}</AlertDescription>
            </Alert>
          )}

          <Button
            className="mt-lg w-full"
            onClick={() => handleSubmit(password)}
            disabled={password.length < 4}
          >
            Mở gia phả
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background relative h-dvh w-full">
      {tree && <TreeClient treeId={tree.id} />}
      {isMobile && (
        <p className="text-text-secondary bottom-md text-caption pointer-events-none absolute left-0 w-full text-center">
          Xem gia phả trên điện thoại. Muốn sửa, hãy mở liên kết này trên máy
          tính.
        </p>
      )}
    </div>
  );
}
