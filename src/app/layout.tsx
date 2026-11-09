import type { Metadata, Viewport } from 'next';
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

const description =
  'TreeMaker là không gian dành cho gia phả và câu chuyện gia đình, nơi trân trọng cội nguồn và gắn kết thế hệ qua thời gian.';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'TreeMaker',
  title: 'TreeMaker | Gìn giữ gia phả và kết nối các thế hệ gia đình',
  description,
  icons: {
    icon: ['/favicon.svg', '/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'TreeMaker | Gìn giữ gia phả và kết nối các thế hệ gia đình',
    description,
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
    title: 'TreeMaker | Gìn giữ gia phả và kết nối các thế hệ gia đình',
    description,
    images: ['/twitter-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#8c1f2a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${appUrl}/#website`,
      url: appUrl,
      name: 'TreeMaker',
      description,
      inLanguage: 'vi-VN',
      publisher: { '@id': `${appUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${appUrl}/#organization`,
      name: 'TreeMaker',
      url: appUrl,
      logo: `${appUrl}/brand/lockup-horizontal.svg`,
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-center" closeButton />
      </body>
    </html>
  );
}
