import { AuthForm } from '@/features/auth';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Đăng nhập | TreeMaker',
  description: 'Truy cập vào hệ thống quản lý gia phả của bạn.',
};

// Trang đăng nhập hệ thống.
export default function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-dvh items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-serif text-4xl font-black tracking-tight">
            Tree<span className="text-primary font-light italic">Maker</span>
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
