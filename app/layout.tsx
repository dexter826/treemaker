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
  title: 'Family Tree Maker',
  description: 'A modern, interactive family tree builder with Google Login and public sharing.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, cormorantGaramond.variable)}>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
