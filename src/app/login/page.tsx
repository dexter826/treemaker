import { AuthForm } from '@/features/auth';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Đăng nhập | TreeMaker',
  description: 'Truy cập vào hệ thống quản lý gia phả của bạn.',
};

export default function LoginPage() {
  return (
    <div className="bg-background p-md flex min-h-dvh items-center justify-center">
      <div className="gap-xxl flex w-full max-w-md flex-col">
        <div className="gap-xs flex flex-col items-center">
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
