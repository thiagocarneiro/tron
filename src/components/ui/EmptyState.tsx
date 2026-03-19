'use client'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/formatters'

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
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#555]" />
      </div>
      <h3 className="text-base font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#a0a0a0] max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[#FF3B30] hover:bg-[#E0342B] text-white rounded-xl text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
