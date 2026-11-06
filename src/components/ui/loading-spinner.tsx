import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  textClassName,
}: LoadingSpinnerProps) {
  return (
    <div className="gap-sm flex flex-col items-center justify-center">
      <Loader2
        className={cn(
          'text-primary motion-safe:animate-spin',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className={cn('text-text-secondary text-caption', textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}
