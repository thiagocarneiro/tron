'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/formatters'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[#a0a0a0]">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-[#1a1a1a] border rounded-xl text-white placeholder-[#555] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500',
            error ? 'border-red-500' : 'border-[#2a2a2a]',
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {helperText && !error && <p className="text-[#555] text-xs">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
