'use client'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/formatters'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-md bg-[#201f1f] flex items-center justify-center mb-6">
        <Icon size={28} className="text-white/25" />
      </div>
      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] uppercase tracking-wider text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-white/40 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="md" className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
