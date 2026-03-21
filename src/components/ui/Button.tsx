'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/formatters'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const variants = {
  primary: 'gradient-cta text-white shadow-[0_4px_24px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_32px_rgba(255,59,48,0.35)]',
  secondary: 'ghost-border text-[#ff8e80] hover:bg-white/5',
  ghost: 'text-white/60 hover:text-white hover:bg-white/5',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-sm',
  xl: 'px-8 py-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-semibold uppercase tracking-wider transition-all duration-200 touch-target',
          'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
