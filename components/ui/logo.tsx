import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 240, height = 160 }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center justify-center transition-opacity hover:opacity-80", className)}>
      <Image 
        src="/logo.png" 
        alt="TreeMaker Logo" 
        width={width} 
        height={height} 
        priority
        className="object-contain"
      />
    </Link>
  );
}
