import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="border-foreground bg-card text-card-foreground shadow-brutal-lg w-full max-w-md space-y-4 border-2 p-8 text-center">
        <h1 className="text-3xl font-black tracking-wide uppercase">
          Không tìm thấy trang
        </h1>
        <p className="text-muted-foreground text-sm">
          Liên kết có thể đã thay đổi hoặc không còn tồn tại.
        </p>
        <Link href="/" className="inline-block">
          <Button>Trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
