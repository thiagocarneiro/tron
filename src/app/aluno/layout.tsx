'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, TrendingUp, User, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utils/formatters'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const tabs = [
  { href: '/aluno/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/aluno/progresso', label: 'Progresso', icon: TrendingUp },
  { href: '/aluno/corpo', label: 'Corpo', icon: User },
  { href: '/aluno/mais', label: 'Mais', icon: MoreHorizontal },
]

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide tab bar during active session
  const isSession = pathname.startsWith('/aluno/sessao')

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
          <main className={cn('flex-1 pb-20', isSession && 'pb-0')}>
            {children}
          </main>

          {!isSession && (
            <nav
              className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#1a1a1a] safe-bottom z-40"
              aria-label="Navegação principal"
            >
              <div className="flex items-center justify-around max-w-lg mx-auto">
                {tabs.map(tab => {
                  const isActive = pathname.startsWith(tab.href)
                  const Icon = tab.icon
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex flex-col items-center gap-1 py-3 px-4 touch-target transition-all duration-200',
                        isActive
                          ? 'text-[#FF3B30] scale-105'
                          : 'text-[#555] hover:text-[#888] active:scale-95'
                      )}
                    >
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[10px] font-medium">{tab.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </ErrorBoundary>
    </ToastProvider>
  )
}
