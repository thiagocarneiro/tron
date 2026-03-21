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
      <div className="space-y-2">
        {label && (
          <label className="label-caps">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-[#131313] rounded-md text-white placeholder-white/20',
            'transition-all duration-200',
            'focus:outline-none focus:ring-1 focus:ring-[#ff8e80]/40',
            error && 'ring-1 ring-[#EF4444]/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-[#EF4444] text-xs">{error}</p>}
        {helperText && !error && <p className="text-white/30 text-xs">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
