'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/utils/formatters'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const icons = {
    success: <CheckCircle size={18} className="text-green-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
    info: <Info size={18} className="text-blue-400 shrink-0" />,
  }

  const colors = {
    success: 'border-green-500/30 bg-green-950/30',
    error: 'border-red-500/30 bg-red-950/30',
    info: 'border-blue-500/30 bg-blue-950/30',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="alert"
            aria-live="polite"
            className={cn(
              'flex items-center gap-3 px-4 py-3 border rounded-xl shadow-2xl pointer-events-auto',
              'animate-slide-in backdrop-blur-md',
              'sm:min-w-[320px] sm:max-w-[420px]',
              colors[toast.type]
            )}
          >
            {icons[toast.type]}
            <span className="text-sm text-white flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-[#666] hover:text-white transition-colors touch-target"
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
