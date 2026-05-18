import type { Metadata } from 'next';
import './globals.css';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans' });
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-serif',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://treemaker.vercel.app');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
  description: 'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: appUrl,
    title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
    description: 'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
    siteName: 'TreeMaker',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'TreeMaker - Xây dựng cây gia phả trực tuyến',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TreeMaker | Xây dựng cây gia phả trực tuyến',
    description: 'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn('font-sans', inter.variable, cormorantGaramond.variable)}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="top-center" theme="light" closeButton />
      </body>
    </html>
  );
}
