import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  textClassName?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
}

export function LoadingSpinner({ size = 'md', className, text, textClassName }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
      {text && (
        <p className={cn('font-serif italic text-muted-foreground tracking-widest uppercase text-sm', textClassName)}>
          {text}
        </p>
      )}
    </div>
  )
}