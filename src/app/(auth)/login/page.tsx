'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, isLoading, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos')
      return
    }

    try {
      await login(email, password)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string }; status?: number } }
      if (axiosError.response?.status === 401) {
        setError('Email ou senha incorretos')
      } else if (authError) {
        setError(authError)
      } else if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error)
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    }
  }

  return (
    <div className="font-[family-name:var(--font-body)] selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center overflow-hidden bg-background relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-dim/10 rounded-full blur-[120px]" />
        {/* Watermark text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] select-none pointer-events-none font-[family-name:var(--font-headline)] font-black text-[20vw] leading-none text-white whitespace-nowrap flex items-center justify-center">
          TRON TRON TRON
        </div>
      </div>

      {/* Grid background pattern */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #494847 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Kinetic Background Accents (Desktop) */}
      <div className="hidden lg:block fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-tertiary/5 blur-[120px] rounded-full" />
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <main className="relative z-10 w-full max-w-md p-6 lg:hidden">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 animate-fade-in-down">
          <div className="mb-4">
            <span className="material-symbols-outlined text-5xl text-primary text-glow">fitness_center</span>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl tracking-tighter text-on-background italic uppercase">
            TRON <span className="text-primary">FITNESS</span>
          </h1>
          <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.3em] text-on-surface-variant mt-2 font-medium">
            Engineered for performance
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
          {/* Error Message */}
          {error && (
            <div className="bg-error/10 rounded-md px-4 py-3 text-error text-sm text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Email Field */}
            <div className="relative group">
              <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  autoComplete="email"
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary h-14 px-4 font-[family-name:var(--font-body)] text-on-surface placeholder:text-on-surface-variant/30 rounded-md transition-all outline-none"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-outline-variant/20 group-focus-within:bg-primary transition-colors" />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Senha
                </label>
                <Link
                  href="#"
                  className="font-[family-name:var(--font-label)] text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary h-14 px-4 font-[family-name:var(--font-body)] text-on-surface placeholder:text-on-surface-variant/30 rounded-md transition-all outline-none"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-outline-variant/20 group-focus-within:bg-primary transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant touch-target flex items-center justify-center"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full kinetic-gradient h-16 rounded-md flex items-center justify-center group active:scale-95 transition-all duration-200 shadow-[0_8px_30px_rgb(226,36,31,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span className="font-[family-name:var(--font-headline)] font-bold text-lg uppercase tracking-tighter text-white mr-2">
                  Entrar
                </span>
                <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          {/* Secondary Action */}
          <div className="text-center">
            <p className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
              Ainda n&atilde;o tem uma conta?{' '}
              <Link
                href="/register"
                className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-tight ml-1 hover:underline underline-offset-4"
              >
                Registrar-se
              </Link>
            </p>
          </div>
        </form>

        {/* Tactical Data Footer */}
        <div className="mt-24 grid grid-cols-3 gap-px bg-outline-variant/10">
          <div className="bg-background py-4 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-headline)] font-bold text-lg text-on-surface tabular-nums">v2.4</span>
            <span className="font-[family-name:var(--font-label)] text-[8px] uppercase tracking-widest text-on-surface-variant">Build</span>
          </div>
          <div className="bg-background py-4 flex flex-col items-center justify-center border-x border-outline-variant/10">
            <span className="font-[family-name:var(--font-headline)] font-bold text-lg text-on-surface tabular-nums">98%</span>
            <span className="font-[family-name:var(--font-label)] text-[8px] uppercase tracking-widest text-on-surface-variant">Uptime</span>
          </div>
          <div className="bg-background py-4 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-headline)] font-bold text-lg text-on-surface">SSL</span>
            <span className="font-[family-name:var(--font-label)] text-[8px] uppercase tracking-widest text-on-surface-variant">Secure</span>
          </div>
        </div>
      </main>

      {/* ===== DESKTOP LAYOUT ===== */}
      <main className="hidden lg:grid relative z-10 w-full max-w-[1200px] px-6 grid-cols-2 items-center gap-12">
        {/* Brand Side */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h1 className="font-[family-name:var(--font-headline)] font-black text-4xl tracking-[0.2em] text-on-background">KINETIC ENGINE</h1>
          </div>

          <div className="space-y-2">
            <p className="font-[family-name:var(--font-headline)] text-6xl xl:text-7xl font-bold leading-tight tracking-tighter uppercase">
              Engineered for <br />
              <span className="text-primary italic">Performance</span>
            </p>
            <div className="h-1 w-24 bg-primary" />
          </div>

          <p className="text-on-surface-variant font-[family-name:var(--font-body)] text-lg max-w-md leading-relaxed">
            The high-intensity digital spotter for elite athletes. Access your tactical training dashboard and push beyond your genetic limits.
          </p>

          <div className="pt-8 flex items-center gap-8">
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-background tabular-nums">124k+</span>
              <span className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-outline">Sessions Logged</span>
            </div>
            <div className="w-px h-10 bg-outline-variant/30" />
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-background tabular-nums">98.2%</span>
              <span className="font-[family-name:var(--font-label)] text-xs uppercase tracking-widest text-outline">PR Achievement Rate</span>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md glass-panel p-10 rounded-xl border border-outline-variant/15 shadow-2xl relative overflow-hidden">
            {/* Red Accent Glow Top */}
            <div className="absolute top-0 left-0 right-0 h-1 kinetic-gradient" />

            <div className="mb-10">
              <h2 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-on-surface">Login to Access</h2>
              <p className="text-on-surface-variant text-sm mt-1">Enter your athlete credentials to proceed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Message */}
              {error && (
                <div className="bg-error/10 rounded-md px-4 py-3 text-error text-sm text-center animate-shake">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="relative group input-focus-accent transition-all">
                <label className="block font-[family-name:var(--font-label)] text-[10px] uppercase tracking-[0.2em] text-outline mb-2 group-focus-within:text-primary transition-colors">
                  Tactical ID (Email)
                </label>
                <div className="flex items-center border-b border-outline-variant/40 pb-2 transition-all group-focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3 text-xl">alternate_email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@kinetic.engine"
                    autoComplete="email"
                    className="bg-transparent border-none focus:ring-0 w-full p-0 text-on-surface placeholder:text-surface-bright font-[family-name:var(--font-body)] text-lg outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group input-focus-accent transition-all">
                <div className="flex justify-between items-end mb-2">
                  <label className="block font-[family-name:var(--font-label)] text-[10px] uppercase tracking-[0.2em] text-outline group-focus-within:text-primary transition-colors">
                    Access Key (Password)
                  </label>
                  <Link href="#" className="text-[10px] uppercase tracking-wider text-outline hover:text-primary transition-colors">
                    Forgot Key?
                  </Link>
                </div>
                <div className="flex items-center border-b border-outline-variant/40 pb-2 transition-all group-focus-within:border-primary">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary mr-3 text-xl">lock_open</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="bg-transparent border-none focus:ring-0 w-full p-0 text-on-surface placeholder:text-surface-bright font-[family-name:var(--font-body)] text-lg outline-none"
                  />
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-5 h-5 rounded-sm border border-outline-variant/50 flex items-center justify-center group-hover:border-primary transition-colors">
                  <div className="w-2.5 h-2.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs font-[family-name:var(--font-label)] text-on-surface-variant uppercase tracking-wider">
                  Maintain Active Session
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full kinetic-gradient py-5 rounded-md font-[family-name:var(--font-headline)] font-extrabold text-sm tracking-[0.2em] text-on-primary-fixed shadow-[0_10px_30px_rgba(255,142,128,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'INITIATE ENGINE'
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-xs font-[family-name:var(--font-body)] text-on-surface-variant">
                Not part of the elite tier?{' '}
                <Link href="/register" className="text-primary font-bold ml-1 hover:underline tracking-tighter uppercase">
                  Apply for entry
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Decor (Desktop only) */}
      <footer className="hidden lg:flex fixed bottom-8 left-8 right-8 justify-between items-end pointer-events-none opacity-40">
        <div className="flex flex-col gap-1">
          <span className="font-[family-name:var(--font-label)] text-[8px] uppercase tracking-[0.5em] text-outline">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-[family-name:var(--font-label)] text-[10px] uppercase text-on-surface">Engine Core Nominal</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-[family-name:var(--font-label)] text-[8px] uppercase tracking-[0.5em] text-outline">Firmware v2.4.0-kinetic</span>
          <p className="font-[family-name:var(--font-label)] text-[10px] uppercase text-on-surface">&copy; 2024 TRON FITNESS SYSTEMS</p>
        </div>
      </footer>
    </div>
  )
}
