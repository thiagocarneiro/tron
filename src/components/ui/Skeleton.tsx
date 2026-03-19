import { cn } from '@/utils/formatters'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#252525] rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      style={{ width, height }}
    />
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton width={60} height={24} className="rounded-full" />
        <Skeleton width={80} height={24} className="rounded-full" />
        <Skeleton width={50} height={24} className="rounded-full" />
      </div>
    </div>
  )
}
