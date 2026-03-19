'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Dumbbell, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />

      {/* Logo / Brand */}
      <div className="mb-10 flex flex-col items-center animate-[fadeInDown_0.6s_ease-out]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold tracking-tight">
          TRON <span className="text-red-500">Fitness</span>
        </h1>
        <p className="text-[#a0a0a0] text-sm mt-1">Acompanhamento de treinos</p>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-sm animate-[fadeInUp_0.6s_ease-out]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center animate-[shake_0.4s_ease-in-out]">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#a0a0a0]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full h-12 px-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#555] text-sm outline-none transition-all duration-200 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#a0a0a0]">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#555] text-sm outline-none transition-all duration-200 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#a0a0a0] transition-colors touch-target"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm transition-all duration-200 hover:from-red-600 hover:to-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-sm text-[#a0a0a0]">
          Ainda não tem conta?{' '}
          <Link
            href="/register"
            className="text-red-500 font-medium hover:text-red-400 transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>

      {/* Animations defined as inline keyframes via Tailwind arbitrary values are limited,
          so we add them via a style tag */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  )
}
