import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full border-2 border-foreground bg-card text-card-foreground p-8 shadow-[6px_6px_0px_0px_var(--color-foreground)] text-center space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-wide">Không tìm thấy trang</h1>
        <p className="text-sm text-muted-foreground">Liên kết có thể đã thay đổi hoặc không còn tồn tại.</p>
        <Link href="/" className="inline-block">
          <Button>Trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
