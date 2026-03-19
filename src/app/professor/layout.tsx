'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, BookOpen, Dumbbell, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/formatters'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const navItems = [
  { href: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/professor/alunos', label: 'Alunos', icon: Users },
  { href: '/professor/programas', label: 'Programas', icon: BookOpen },
  { href: '/professor/exercicios', label: 'Exercícios', icon: Dumbbell },
]

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    document.cookie = 'tron-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    router.push('/login')
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Sidebar overlay for mobile */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              'fixed md:static z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}
            aria-label="Navegação do professor"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900">
                <span className="text-red-500">TRON</span> Fitness
              </h1>
              <p className="text-xs text-gray-500 mt-1">Painel do Professor</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
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
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-red-50 text-red-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User info + logout */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-2 mb-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {user?.name?.charAt(0) || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={18} />
                Sair
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
