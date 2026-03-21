'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/utils/formatters'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'

const mobileNavTabs = [
  { href: '/aluno/treinos', label: 'Workouts', icon: 'fitness_center', iconFill: true },
  { href: '/aluno/progresso', label: 'Progress', icon: 'leaderboard', iconFill: false },
  { href: '/aluno/corpo', label: 'Body', icon: 'accessibility_new', iconFill: false },
  { href: '/aluno/mais', label: 'More', icon: 'more_horiz', iconFill: false },
]

const sidebarNavItems = [
  { href: '/aluno/treinos', label: 'Workouts', icon: 'fitness_center' },
  { href: '/aluno/progresso', label: 'Progress', icon: 'insights' },
  { href: '/aluno/corpo', label: 'Body', icon: 'accessibility_new' },
  { href: '/aluno/mais', label: 'Settings', icon: 'settings' },
]

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSession = pathname.startsWith('/aluno/sessao')
  const { user, logout } = useAuth()

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background text-on-background font-[family-name:var(--font-body)]">
          {/* ===== MOBILE TOP APP BAR ===== */}
          {!isSession && (
            <header className="lg:hidden bg-surface-container-low fixed top-0 w-full z-50 shadow-[0_4px_20px_rgba(255,59,48,0.1)]">
              <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-black text-[#FF3B30] italic font-[family-name:var(--font-headline)] uppercase tracking-tighter">
                    TRON FITNESS
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-primary/20 overflow-hidden flex items-center justify-center bg-surface-container-high">
                    <span className="text-xs font-bold text-primary">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* ===== DESKTOP SIDEBAR ===== */}
          {!isSession && (
            <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-surface-bright/15 shadow-[4px_0_24px_rgba(255,59,48,0.05)] z-40 py-8 px-4 gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 kinetic-gradient rounded-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-black font-bold">bolt</span>
                </div>
                <span className="text-xl font-bold text-white font-[family-name:var(--font-headline)]">KINETIC</span>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-2 flex-grow mt-4">
                {sidebarNavItems.map(item => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-md font-[family-name:var(--font-headline)] font-medium transition-all',
                        isActive
                          ? 'text-[#FF3B30] bg-surface-container-high border-r-4 border-[#FF3B30]'
                          : 'text-gray-500 hover:text-white hover:bg-surface-container-high'
                      )}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Start Session Button */}
              <div className="mt-auto space-y-4">
                <Link
                  href="/aluno/treinos"
                  className="block w-full kinetic-gradient text-black font-[family-name:var(--font-headline)] font-black py-4 rounded-md tracking-widest text-sm text-center active:scale-95 transition-all"
                >
                  START SESSION
                </Link>

                {/* Support & Logout */}
                <div className="pt-6 border-t border-outline-variant/15 flex flex-col gap-2">
                  <Link
                    href="/aluno/mais"
                    className="flex items-center gap-4 px-4 py-2 text-gray-500 hover:text-white font-[family-name:var(--font-headline)] transition-all"
                  >
                    <span className="material-symbols-outlined">help</span>
                    <span>Support</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-4 px-4 py-2 text-gray-500 hover:text-white font-[family-name:var(--font-headline)] transition-all w-full"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* ===== MAIN CONTENT ===== */}
          <main className={cn(
            'flex-1 min-h-screen',
            !isSession && 'pt-16 pb-20 lg:pt-0 lg:pb-0 lg:ml-64'
          )}>
            {children}
          </main>

          {/* ===== MOBILE BOTTOM NAV BAR ===== */}
          {!isSession && (
            <nav
              className="lg:hidden fixed bottom-0 w-full z-50 safe-bottom bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-[#FF3B30]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
              aria-label="Navegacao principal"
            >
              <div className="flex justify-around items-center h-20 px-4 w-full max-w-7xl mx-auto">
                {mobileNavTabs.map(tab => {
                  const isActive = pathname.startsWith(tab.href)
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex flex-col items-center justify-center duration-300',
                        isActive
                          ? 'text-[#FF3B30] scale-110'
                          : 'text-white/40 hover:text-white active:translate-y-[-2px]'
                      )}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {tab.icon}
                      </span>
                      <span className="font-[family-name:var(--font-label)] text-[10px] font-bold uppercase tracking-widest mt-1">
                        {tab.label}
                      </span>
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
