import { cn } from '@/utils/formatters'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'solid' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, color, variant = 'solid', size = 'sm', className }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variant === 'solid'
          ? 'bg-[#252525] text-[#a0a0a0]'
          : 'border border-[#2a2a2a] text-[#a0a0a0]',
        sizeClasses[size],
        className
      )}
      style={color ? {
        backgroundColor: variant === 'solid' ? `${color}20` : 'transparent',
        color: color,
        borderColor: variant === 'outline' ? color : undefined,
      } : undefined}
    >
      {children}
    </span>
  )
}
