'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/api/client'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setCookie = (token: string, persistent?: boolean) => {
    const maxAge = persistent ? 60 * 60 * 24 * 7 : 60 * 15 // 7 days or 15 min
    document.cookie = `tron-auth-token=${token}; path=/; max-age=${maxAge}; samesite=lax`
  }

  const removeCookie = () => {
    document.cookie = 'tron-auth-token=; path=/; max-age=0'
  }

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post('/auth/login', { email, password })
      setAuth(data.user, data.accessToken, data.refreshToken)
      setCookie(data.accessToken, rememberMe)

      if (data.user.role === 'TRAINER') {
        router.push('/professor/dashboard')
      } else {
        router.push('/aluno/treinos')
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, setAuth])

  const register = useCallback(async (data: {
    name: string
    email: string
    password: string
    role: 'STUDENT' | 'TRAINER'
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post('/auth/register', data)
      await login(data.email, data.password)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao criar conta'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [login])

  const logout = useCallback(async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Ignore logout API errors
    } finally {
      storeLogout()
      removeCookie()
      router.push('/login')
    }
  }, [router, storeLogout])

  return { user, isAuthenticated, isLoading, error, login, register, logout }
}
