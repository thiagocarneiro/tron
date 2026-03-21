'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, Dumbbell, LogOut, Menu, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/formatters'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const navItems = [
  { href: '/professor/dashboard', label: 'Workouts', icon: LayoutDashboard },
  { href: '/professor/alunos', label: 'Alunos', icon: Users },
  { href: '/professor/programas', label: 'Programas', icon: BookOpen },
  { href: '/professor/exercicios', label: 'Exercícios', icon: Dumbbell },
]

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#0e0e0e] flex">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#131313] rounded-md text-white/60 hover:text-white transition-colors"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              'fixed md:static z-40 h-screen w-60 bg-[#0e0e0e] flex flex-col transition-transform duration-300',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}
            aria-label="Navegação do professor"
          >
            {/* Logo */}
            <div className="p-6 pb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md gradient-cta flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#ff8e80]">Kinetic</span>
              </div>
            </div>

            {/* User */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'Professor'}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">Professor</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map(item => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all duration-200',
                      isActive
                        ? 'bg-[#131313] text-[#ff8e80] font-semibold'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-2.5 w-full rounded-md text-sm text-white/30 hover:text-[#EF4444] hover:bg-white/5 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-h-screen md:ml-0">
            <div className="max-w-7xl mx-auto p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  )
}
