import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-title-lg font-semibold">Không tìm thấy trang</h1>
        <p className="text-text-secondary text-body-sm">
          Liên kết có thể đã thay đổi hoặc không còn tồn tại.
        </p>
        <Link href="/">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
