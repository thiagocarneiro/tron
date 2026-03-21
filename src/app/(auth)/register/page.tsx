'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type Role = 'STUDENT' | 'TRAINER'

export default function RegisterPage() {
  const { register, isLoading, error: authError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('STUDENT')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    try {
      await register({ name, email, password, role })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string }; status?: number } }
      if (axiosError.response?.status === 409) {
        setError('Este email ja esta cadastrado')
      } else if (authError) {
        setError(authError)
      } else if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error)
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    }
  }

  return (
    <div className="font-[family-name:var(--font-body)] selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center overflow-hidden bg-background p-6 relative">
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

      <main className="relative w-full max-w-md z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 animate-fade-in-down">
          <div className="mb-4">
            <span className="material-symbols-outlined text-5xl text-primary text-glow">fitness_center</span>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-3xl tracking-tighter text-on-background italic uppercase">
            TRON <span className="text-primary">FITNESS</span>
          </h1>
          <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.3em] text-on-surface-variant mt-2 font-medium">
            Create your account
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
          {/* Error Message */}
          {error && (
            <div className="bg-error/10 rounded-md px-4 py-3 text-error text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="relative group">
            <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              Eu sou
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`h-14 rounded-md text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                  role === 'STUDENT'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Aluno
              </button>
              <button
                type="button"
                onClick={() => setRole('TRAINER')}
                className={`h-14 rounded-md text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                  role === 'TRAINER'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-lg">school</span>
                Professor
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="relative group">
            <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
              Nome completo
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary h-14 px-4 font-[family-name:var(--font-body)] text-on-surface placeholder:text-on-surface-variant/30 rounded-md transition-all outline-none"
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-outline-variant/20 group-focus-within:bg-primary transition-colors" />
            </div>
          </div>

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
            <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div className="relative group">
            <label className="block font-[family-name:var(--font-headline)] font-semibold text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary h-14 px-4 font-[family-name:var(--font-body)] text-on-surface placeholder:text-on-surface-variant/30 rounded-md transition-all outline-none"
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-outline-variant/20 group-focus-within:bg-primary transition-colors" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant touch-target flex items-center justify-center"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-sm">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full kinetic-gradient h-16 rounded-md flex items-center justify-center group active:scale-95 transition-all duration-200 shadow-[0_8px_30px_rgb(226,36,31,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span className="font-[family-name:var(--font-headline)] font-bold text-lg uppercase tracking-tighter text-white mr-2">
                  Criar Conta
                </span>
                <span className="material-symbols-outlined text-white group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="font-[family-name:var(--font-label)] text-xs text-on-surface-variant">
            Ja tem uma conta?{' '}
            <Link
              href="/login"
              className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-tight ml-1 hover:underline underline-offset-4"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
