'use client'
import { HTMLAttributes } from 'react'
import { cn } from '@/utils/formatters'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  surface?: 'low' | 'high' | 'bright'
}

const surfaceClasses = {
  low: 'bg-[#131313]',
  high: 'bg-[#201f1f]',
  bright: 'bg-[#2c2c2c]',
}

export function Card({ className, hoverable, padding = 'md', surface = 'high', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div
      className={cn(
        'rounded-md',
        surfaceClasses[surface],
        hoverable && 'hover:bg-[#2c2c2c] transition-colors duration-200 cursor-pointer active:scale-[0.98]',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
