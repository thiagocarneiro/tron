'use client'

import { useEffect, useState } from 'react'
import api from '@/api/client'
import { ProgressChart } from '@/components/student/ProgressChart'
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
  const [selectedExercise, setSelectedExercise] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/student/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/student/personal-records').then(r => {
        const records = r.data || []
        setPrs(records.map((pr: Record<string, unknown>) => ({
          exerciseId: (pr.exercise as Record<string, unknown>)?.id || pr.exerciseId,
          exerciseName: (pr.exercise as Record<string, unknown>)?.name || '',
          weight: pr.weight,
          reps: pr.reps,
          date: pr.date,
          isNew: pr.isNew,
        })))
      }).catch(() => {}),
      api.get('/student/sessions?limit=10').then(r => {
        const sessions = r.data?.data || []
        setSessions(sessions.map((s: Record<string, unknown>) => {
          const workout = s.workout as Record<string, unknown> | null
          return {
            id: s.id,
            workoutName: workout?.name || 'Treino',
            workoutIcon: workout?.icon || '',
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            duration: s.duration,
            rating: s.rating,
          }
        }))
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      api.get(`/student/exercises/${selectedExercise}/history?limit=20`)
        .then(r => {
          interface HistorySession {
            date?: string
            startedAt?: string
            sets?: { weight?: number; reps?: number }[]
          }
          const sessions = r.data?.sessions || []
          const historyData = sessions.flatMap((session: HistorySession) =>
            (session.sets || [])
              .filter((s) => s.weight)
              .map((s) => ({ date: session.date || session.startedAt || '', weight: s.weight || 0 }))
          )
          setChartData(historyData)
        })
        .catch(() => setChartData([]))
    }
  }, [selectedExercise])

  const exerciseOptions = prs.map(pr => ({ id: pr.exerciseId, name: pr.exerciseName }))

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton width="50%" height={40} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={100} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 page-transition">
      {/* Hero Heading */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
        <div>
          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-headline)] font-black tracking-tighter text-on-surface uppercase">
            Progresso
          </h2>
          <p className="text-primary-fixed font-[family-name:var(--font-label)] text-sm tracking-[0.2em] uppercase mt-2 hidden lg:block">
            Analytical Engine - Session Data v4.2
          </p>
          <span className="text-primary font-[family-name:var(--font-headline)] font-bold tracking-widest text-xs uppercase lg:hidden">
            Student Dashboard
          </span>
        </div>
        <div className="hidden lg:flex gap-4">
          <div className="px-6 py-3 bg-surface-container-low border border-outline-variant/10 rounded-md flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            <span className="font-[family-name:var(--font-headline)] font-bold">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
            </span>
          </div>
          <button className="w-12 h-12 bg-surface-container-high rounded-md flex items-center justify-center hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      {/* Stat Cards: Bento Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-surface-container-low p-6 rounded-lg flex flex-col justify-between border-l-2 border-primary relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
              <span className="material-symbols-outlined text-6xl">speed</span>
            </div>
            <span className="text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest lg:mb-4">Volume Load</span>
            <div className="mt-4 lg:mt-0 flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-headline)] font-black text-on-surface tabular-nums">{stats.currentStreak}</span>
              <span className="text-primary text-xs font-bold uppercase">DAYS</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
              <span className="material-symbols-outlined text-6xl">timer</span>
            </div>
            <span className="text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest lg:mb-4">Sessions / Mo</span>
            <div className="mt-4 lg:mt-0 flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-headline)] font-black text-on-surface tabular-nums">{stats.sessionsThisMonth}</span>
              <span className="text-on-surface-variant text-xs font-bold uppercase">/ 20</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
              <span className="material-symbols-outlined text-6xl">reorder</span>
            </div>
            <span className="text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest lg:mb-4">
              <span className="lg:hidden">Lifetime Sessions</span>
              <span className="hidden lg:inline">Total Sets</span>
            </span>
            <div className="mt-4 lg:mt-0 flex items-end gap-2">
              <span className="text-4xl font-[family-name:var(--font-headline)] font-black text-on-surface tabular-nums">{stats.totalSessions}</span>
              <span className="text-primary font-[family-name:var(--font-headline)] font-bold pb-1 hidden lg:inline">COMPLETED</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-lg flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden lg:block">
              <span className="material-symbols-outlined text-6xl">favorite</span>
            </div>
            <div className="relative z-10">
              <span className="text-on-surface-variant font-[family-name:var(--font-label)] text-[10px] uppercase tracking-widest lg:mb-4 block">Total Volume</span>
              <div className="mt-4 lg:mt-0 flex items-baseline gap-1">
                <span className="text-4xl font-[family-name:var(--font-headline)] font-black text-on-surface tabular-nums">{formatWeight(stats.totalVolume)}</span>
                <span className="text-primary font-[family-name:var(--font-headline)] font-bold">KG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Progression Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-8 space-y-8 lg:border-l-4 lg:border-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-[family-name:var(--font-headline)] font-black uppercase tracking-tight">Load Progression</h3>
              <p className="text-on-surface-variant text-sm font-[family-name:var(--font-label)] hidden lg:block">Monthly Compound Growth</p>
            </div>
            {exerciseOptions.length > 0 && (
              <div className="relative w-full md:w-auto">
                <select
                  value={selectedExercise}
                  onChange={e => setSelectedExercise(e.target.value)}
                  className="bg-surface-container-high border-none text-on-surface text-sm font-[family-name:var(--font-label)] rounded-md px-4 py-2 pr-10 appearance-none w-full focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Selecione um exercicio</option>
                  {exerciseOptions.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
              </div>
            )}
          </div>

          {/* Time filter buttons (desktop) */}
          <div className="hidden lg:flex bg-surface-container-highest p-1 rounded-md w-fit">
            <button className="px-4 py-1 text-xs font-bold font-[family-name:var(--font-headline)] bg-primary text-on-primary rounded">1M</button>
            <button className="px-4 py-1 text-xs font-bold font-[family-name:var(--font-headline)] text-on-surface-variant hover:text-white transition-colors">3M</button>
            <button className="px-4 py-1 text-xs font-bold font-[family-name:var(--font-headline)] text-on-surface-variant hover:text-white transition-colors">6M</button>
            <button className="px-4 py-1 text-xs font-bold font-[family-name:var(--font-headline)] text-on-surface-variant hover:text-white transition-colors">1Y</button>
          </div>

          {selectedExercise && chartData.length > 0 ? (
            <ProgressChart data={chartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-on-surface-variant text-sm">
              {selectedExercise ? 'Sem dados para este exercicio' : 'Selecione um exercicio para ver a progressao'}
            </div>
          )}
        </div>

        {/* PR Grid */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-sm font-[family-name:var(--font-headline)] font-bold uppercase tracking-[0.2em] text-on-surface-variant flex items-center justify-between">
            Personal Records
            <span className="text-primary cursor-pointer">View All</span>
          </h3>
          {/* Mobile: compact list, Desktop: 2-col grid with medal icons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {prs.length > 0 ? (
              prs.slice(0, 4).map((pr, i) => (
                <div
                  key={pr.exerciseId}
                  className={`bg-surface-container-low lg:bg-surface-container-low p-4 lg:p-6 rounded-lg flex items-start justify-between ${
                    pr.isNew ? 'border-r-4 lg:border-r-0 lg:border-l-2 border-primary' : 'lg:border-l-2 border-outline-variant'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] font-[family-name:var(--font-label)] uppercase tracking-widest mb-1 ${pr.isNew ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {pr.exerciseName}
                    </p>
                    <h4 className="text-lg lg:text-3xl font-[family-name:var(--font-headline)] font-black text-white">
                      {pr.weight} <span className="text-sm font-normal text-on-surface-variant">KG</span>
                    </h4>
                  </div>
                  <div className="hidden lg:block">
                    {pr.isNew ? (
                      <div className="bg-primary-container/20 p-2 rounded">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                      </div>
                    ) : (
                      <div className="bg-surface-container-highest p-2 rounded">
                        <span className="material-symbols-outlined text-on-surface-variant">fitness_center</span>
                      </div>
                    )}
                  </div>
                  {pr.isNew && (
                    <span className="bg-primary text-on-primary-fixed text-[8px] font-black px-2 py-1 rounded-sm italic lg:hidden">NOVO</span>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-surface-container-low p-6 rounded-lg text-center col-span-full">
                <p className="text-sm text-on-surface-variant">Nenhum PR registrado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-4">
        <h3 className="text-xl font-[family-name:var(--font-headline)] font-extrabold uppercase tracking-tight">
          Recent Sessions History
        </h3>
        <div className="space-y-2">
          {sessions.length > 0 ? (
            sessions.map((session, i) => (
              <div
                key={session.id}
                className={`bg-surface-container-low hover:bg-surface-container-high transition-colors p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${i >= 3 ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-[family-name:var(--font-headline)] font-bold text-lg leading-tight">{session.workoutName}</h4>
                    <p className="text-[10px] text-on-surface-variant font-[family-name:var(--font-label)] uppercase tracking-tighter">
                      {formatDate(session.startedAt)} {session.duration ? `- ${formatDuration(session.duration)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {session.rating && (
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-sm"
                          style={{
                            fontVariationSettings: "'FILL' 1",
                            color: i <= session.rating! ? '#ff8e80' : '#adaaaa',
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant hidden lg:block">chevron_right</span>
                  <button className="bg-transparent border border-outline-variant px-4 py-1.5 rounded-md text-[10px] font-bold uppercase hover:bg-primary hover:text-on-primary-fixed hover:border-primary transition-all lg:hidden">
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-surface-container-low p-8 rounded-lg text-center">
              <p className="text-sm text-on-surface-variant">Nenhuma sessao registrada. Inicie seu primeiro treino!</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating rest timer widget (desktop) */}
      <div className="hidden lg:flex fixed bottom-8 right-8 z-50 glass-panel border border-primary/20 p-4 rounded-xl shadow-[0_12px_40px_rgba(255,59,48,0.2)] items-center gap-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle className="text-surface-container-highest" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4" />
            <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="44" strokeWidth="4" />
          </svg>
          <span className="absolute text-sm font-black font-[family-name:var(--font-headline)]">45</span>
        </div>
        <div className="pr-4">
          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em]">Next Set</p>
          <h6 className="text-white font-[family-name:var(--font-headline)] font-bold">Rest Timer</h6>
        </div>
        <button className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">play_arrow</span>
        </button>
      </div>

      {/* Floating glow decorations */}
      <div className="fixed top-1/4 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}
