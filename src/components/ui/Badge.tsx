import { cn } from '@/utils/formatters'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'solid' | 'outline' | 'pill'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, color, variant = 'solid', size = 'sm', className }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm font-semibold uppercase tracking-wider whitespace-nowrap leading-none',
        'bg-[#201f1f] text-white/50',
        sizeClasses[size],
        className
      )}
      style={color ? {
        backgroundColor: `${color}18`,
        color: color,
      } : undefined}
    >
      {variant === 'pill' && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color || 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}
