import { AuthForm } from '@/features/auth';
import { Metadata } from 'next';
import Image from 'next/image';

const title = 'Đăng nhập | TreeMaker';
const description =
  'TreeMaker là không gian dành cho gia phả và những câu chuyện gia đình, nơi cội nguồn được trân trọng và các thế hệ được gắn kết qua thời gian.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/login',
    siteName: 'TreeMaker',
    title,
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'TreeMaker - Đăng nhập để quản lý cây gia phả',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/twitter-image.png'],
  },
};

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-8">
        <h1 className="flex flex-col items-center gap-2">
          <Image
            src="/brand/lockup-horizontal.svg"
            alt="TreeMaker"
            width={1220}
            height={300}
            unoptimized
            className="h-auto w-56"
            priority
          />
          <span className="text-text-secondary text-caption">
            Gìn giữ gia phả
          </span>
        </h1>

        <AuthForm />
      </div>
    </div>
  );
}
