'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, AlertTriangle, TrendingUp } from 'lucide-react'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/formatters'

interface DashboardData {
  totalStudents: number
  sessionsThisWeek: number
  inactiveStudents: { id: string; name: string; lastSession: string | null }[]
  recentSessions: { id: string; studentName: string; workoutName: string; startedAt: string; rating: number | null }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trainer/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
              <Skeleton width={100} height={16} />
              <Skeleton width={60} height={32} className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const summaryCards = [
    { label: 'Total de Alunos', value: data?.totalStudents || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Sessões na Semana', value: data?.sessionsThisWeek || 0, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Alunos Inativos', value: data?.inactiveStudents?.length || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Média Semanal', value: data?.totalStudents ? Math.round((data.sessionsThisWeek / data.totalStudents) * 10) / 10 : 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon size={20} className={card.color} />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">
            Sessões Recentes
          </h2>
          {data?.recentSessions?.length ? (
            <div className="space-y-3">
              {data.recentSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.studentName}</p>
                    <p className="text-xs text-gray-500">{session.workoutName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(session.startedAt)}</p>
                    {session.rating && (
                      <div className="flex gap-0.5 justify-end">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={i <= session.rating! ? 'text-amber-400' : 'text-gray-200'}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma sessão recente</p>
          )}
        </div>

        {/* Inactive Students */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">
            Alunos Inativos
          </h2>
          {data?.inactiveStudents?.length ? (
            <div className="space-y-3">
              {data.inactiveStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                      {student.name.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  </div>
                  <Badge color="#EF4444" size="sm">
                    {student.lastSession ? `Último: ${formatDate(student.lastSession)}` : 'Sem sessões'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Todos os alunos estão ativos! 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}
