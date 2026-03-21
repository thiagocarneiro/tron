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
        'skeleton-shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      style={{ width, height }}
    />
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="bg-[#201f1f] rounded-md p-5 space-y-4">
      <Skeleton width="40%" height={12} />
      <Skeleton width="70%" height={28} />
      <div className="flex gap-2">
        <Skeleton width={60} height={24} className="rounded-sm" />
        <Skeleton width={80} height={24} className="rounded-sm" />
      </div>
    </div>
  )
}
