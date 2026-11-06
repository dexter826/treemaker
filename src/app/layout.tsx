import type { Metadata } from 'next';
import './globals.css';
import { Be_Vietnam_Pro, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { cn } from '@/lib/utils';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-be-vietnam-pro',
});
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'https://treemaker.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
  description:
    'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
  icons: {
    icon: ['/favicon.svg', '/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
    description:
      'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
    siteName: 'TreeMaker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'TreeMaker - Xây dựng cây gia phả trực tuyến',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
    description:
      'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={cn(
        'font-sans',
        beVietnamPro.variable,
        cormorantGaramond.variable
      )}
    >
      <body
        className="bg-background text-text-primary min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-center" closeButton />
      </body>
    </html>
  );
}
