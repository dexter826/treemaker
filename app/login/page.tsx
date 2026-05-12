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

            <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black font-serif tracking-tight">
            Tree<span className="text-primary italic font-light">Maker</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Hệ thống quản lý gia phả
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
