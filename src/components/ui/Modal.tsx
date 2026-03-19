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
      // Focus trap
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-2xl sm:rounded-2xl p-6',
          'animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          'focus:outline-none',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#252525] rounded-lg transition-colors touch-target"
              aria-label="Fechar modal"
            >
              <X size={20} className="text-[#a0a0a0]" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
