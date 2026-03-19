'use client'
import { HTMLAttributes } from 'react'
import { cn } from '@/utils/formatters'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ className, hoverable, padding = 'md', children, ...props }: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl',
        hoverable && 'hover:bg-[#252525] hover:border-[#333] transition-all duration-200 cursor-pointer active:scale-[0.98]',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
