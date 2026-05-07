import type {Metadata} from 'next';
import './globals.css';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '600', '700'], 
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: 'Family Tree Maker | Xây dựng cây gia phả trực tuyến',
  description: 'Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, cormorantGaramond.variable)}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" theme="light" closeButton={true} />
      </body>
    </html>
  );
}
