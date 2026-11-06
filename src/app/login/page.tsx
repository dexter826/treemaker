import { AuthForm } from '@/features/auth';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Đăng nhập | TreeMaker',
  description: 'Truy cập vào hệ thống quản lý gia phả của bạn.',
};

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/brand/lockup-horizontal.svg"
            alt="TreeMaker"
            width={1220}
            height={300}
            unoptimized
            className="h-auto w-56"
            priority
          />
          <p className="text-text-secondary text-caption">Gìn giữ gia phả</p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
