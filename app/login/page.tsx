import { AuthForm } from '@/components/auth/auth-form';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Đăng nhập | TreeMaker',
  description: 'Truy cập vào hệ thống quản lý gia phả của bạn.',
};

// Trang đăng nhập hệ thống.
export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      <div className="w-full max-w-md z-10 flex flex-col items-center gap-2">
        <div className="w-full flex justify-center -mb-2">
          <Image
            src="/logo.png"
            alt="TreeMaker Logo"
            width={220}
            height={66}
            priority
            className="object-contain"
          />
        </div>

        <div className="w-full relative -left-1">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
