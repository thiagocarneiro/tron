'use client'

import { useEffect, useState } from 'react'
import { Trophy, Flame, Calendar, TrendingUp } from 'lucide-react'
import api from '@/api/client'
import { ProgressChart } from '@/components/student/ProgressChart'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatDuration, formatWeight } from '@/utils/formatters'

interface Stats {
  totalSessions: number
  sessionsThisMonth: number
  currentStreak: number
  totalVolume: number
  averageRating: number
  averageDuration: number
}

interface PR {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
  isNew: boolean
}

interface SessionItem {
  id: string
  workoutName: string
  workoutIcon: string
  startedAt: string
  completedAt: string | null
  duration: number | null
  rating: number | null
}

export default function ProgressoPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [prs, setPrs] = useState<PR[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [chartData, setChartData] = useState<{date:string;weight:number}[]>([])
  const [exercises, setExercises] = useState<{id:string;name:string}[]>([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/student/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/student/personal-records').then(r => setPrs(r.data || [])).catch(() => {}),
      api.get('/student/sessions?limit=10').then(r => setSessions(r.data?.sessions || r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))

    // Get exercise list from program
    api.get('/student/program').then(r => {
      const workouts = r.data?.workouts || []
      const allExercises: {id:string;name:string}[] = []
      // We'll collect unique exercise names from PRs instead
    }).catch(() => {})
  }, [])

  // Load chart data when exercise selected
  useEffect(() => {
    if (selectedExercise) {
      api.get(`/student/exercises/${selectedExercise}/history?limit=20`)
        .then(r => {
          const historyData = (r.data || []).flatMap((session: any) =>
            (session.sets || [])
              .filter((s: any) => s.weight)
              .map((s: any) => ({ date: session.date || session.startedAt, weight: s.weight }))
          )
          setChartData(historyData)
        })
        .catch(() => setChartData([]))
    }
  }, [selectedExercise])

  // Get unique exercises from PRs for selector
  const exerciseOptions = prs.map(pr => ({ id: pr.exerciseId, name: pr.exerciseName }))

  if (loading) {
    return (
      <div className="p-4 space-y-4 safe-top">
        <Skeleton width="50%" height={28} />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={80} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 safe-top">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Progresso</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" className="text-center">
            <Flame size={20} className="mx-auto text-orange-400 mb-1" />
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stats.currentStreak}</p>
            <p className="text-xs text-[#666]">Dias seguidos</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Calendar size={20} className="mx-auto text-blue-400 mb-1" />
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stats.sessionsThisMonth}</p>
            <p className="text-xs text-[#666]">Este mês</p>
          </Card>
          <Card padding="sm" className="text-center">
            <TrendingUp size={20} className="mx-auto text-green-400 mb-1" />
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stats.totalSessions}</p>
            <p className="text-xs text-[#666]">Total sessões</p>
          </Card>
          <Card padding="sm" className="text-center">
            <Trophy size={20} className="mx-auto text-amber-400 mb-1" />
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{formatWeight(stats.totalVolume)}</p>
            <p className="text-xs text-[#666]">Volume total</p>
          </Card>
        </div>
      )}

      {/* Chart Section */}
      {exerciseOptions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[#a0a0a0] mb-2">Progressão de Carga</h2>
          <select
            value={selectedExercise}
            onChange={e => setSelectedExercise(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm mb-3 focus:outline-none focus:border-red-500"
          >
            <option value="">Selecione um exercício</option>
            {exerciseOptions.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          {selectedExercise && <ProgressChart data={chartData} />}
        </div>
      )}

      {/* PRs */}
      <div>
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">🏆 Recordes Pessoais</h2>
        {prs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {prs.map(pr => (
              <Card key={pr.exerciseId} padding="sm">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-[#a0a0a0] line-clamp-1">{pr.exerciseName}</p>
                  {pr.isNew && <Badge color="#FF3B30" size="sm">NOVO</Badge>}
                </div>
                <p className="text-lg font-bold font-[family-name:var(--font-heading)] mt-1">
                  {pr.weight}kg <span className="text-sm text-[#666]">× {pr.reps}</span>
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="md" className="text-center">
            <p className="text-sm text-[#555]">Nenhum PR registrado ainda. Complete sessões de treino!</p>
          </Card>
        )}
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-sm font-medium text-[#a0a0a0] mb-3">Histórico de Sessões</h2>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map(session => (
              <Card key={session.id} padding="sm" hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{session.workoutIcon}</span>
                    <div>
                      <p className="text-sm font-medium">{session.workoutName}</p>
                      <p className="text-xs text-[#666]">{formatDate(session.startedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.duration && (
                      <p className="text-xs text-[#666]">{formatDuration(session.duration)}</p>
                    )}
                    {session.rating && (
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`text-xs ${i <= session.rating! ? 'text-amber-400' : 'text-[#333]'}`}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="md" className="text-center">
            <p className="text-sm text-[#555]">Nenhuma sessão registrada. Inicie seu primeiro treino!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
