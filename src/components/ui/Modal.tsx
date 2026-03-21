'use client'
import { useEffect, useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/formatters'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setTimeout(() => modalRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-[#2c2c2c] rounded-t-lg sm:rounded-lg p-6',
          'animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          'focus:outline-none',
          sizes[size],
          className
        )}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-8 h-1 bg-white/15 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] uppercase tracking-wider">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-md transition-colors touch-target"
              aria-label="Fechar modal"
            >
              <X size={20} className="text-white/40" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
