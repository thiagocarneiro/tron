'use client'

import { useEffect, useState } from 'react'
import api from '@/api/client'
import { WorkoutCard } from '@/components/student/WorkoutCard'
import { WorkoutCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Dumbbell } from 'lucide-react'
import { getCurrentWeek } from '@/utils/formatters'

interface ProgramData {
  id: string
  name: string
  description: string | null
  durationWeeks: number
  phases: { id: string; weekStart: number; weekEnd: number; name: string; description: string; color: string; orderIndex: number }[]
  workouts: { id: string; name: string; icon: string; orderIndex: number; exerciseCount: number; muscleGroups: string[] }[]
  startDate: string
}

export default function TreinosPage() {
  const [program, setProgram] = useState<ProgramData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProgram = () => {
    setLoading(true)
    setError('')
    api.get('/student/program')
      .then(res => {
        const { assignment, program } = res.data
        setProgram({
          ...program,
          startDate: assignment.startDate,
        })
      })
      .catch(err => setError(err.response?.data?.error || 'Erro ao carregar programa'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProgram() }, [])

  /* ======================== LOADING ======================== */
  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        <div className="bg-surface-container-low rounded-xl p-8 space-y-4">
          <div className="h-3 w-28 skeleton-shimmer rounded" />
          <div className="h-9 w-64 skeleton-shimmer rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-28 skeleton-shimmer rounded" />
            <div className="h-4 w-24 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <WorkoutCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  /* ======================== ERROR ======================== */
  if (error) {
    return (
      <div className="p-6 pt-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-md bg-surface-container-high flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary/40 text-3xl">fitness_center</span>
        </div>
        <p className="font-[family-name:var(--font-headline)] text-base font-bold uppercase tracking-wider text-white mb-2">
          Erro ao carregar
        </p>
        <p className="text-sm text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={loadProgram}
          className="inline-flex items-center gap-2 px-5 py-3 ghost-border text-primary rounded-md text-sm font-semibold uppercase tracking-wider hover:bg-white/5 transition-all active:scale-[0.97]"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Tentar novamente
        </button>
      </div>
    )
  }

  /* ======================== EMPTY ======================== */
  if (!program) {
    return (
      <div className="p-6 animate-fade-in">
        <EmptyState
          icon={Dumbbell}
          title="Nenhum programa ativo"
          description="Peca ao seu professor para atribuir um programa de treino."
        />
      </div>
    )
  }

  /* ======================== DATA ======================== */
  const currentWeek = program.startDate ? getCurrentWeek(new Date(program.startDate)) : 1
  const currentPhaseIndex = program.phases.findIndex(p => currentWeek >= p.weekStart && currentWeek <= p.weekEnd)
  const currentPhase = program.phases[currentPhaseIndex >= 0 ? currentPhaseIndex : 0]
  const sortedWorkouts = [...program.workouts].sort((a, b) => a.orderIndex - b.orderIndex)
  const totalSessions = program.durationWeeks * sortedWorkouts.length

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen page-transition">

      {/* ===================== HERO HEADER ===================== */}
      {/* Mobile Hero */}
      <section className="mb-10 lg:hidden">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 border-l-4 border-primary">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="text-primary font-[family-name:var(--font-headline)] font-bold text-sm tracking-[0.2em] uppercase mb-2 block">
              Programa Atual
            </span>
            <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-headline)] font-black uppercase tracking-tighter text-on-surface">
              {program.name}
            </h2>
            <div className="flex items-center gap-4 mt-4 text-on-surface-variant font-medium">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span className="text-sm">{program.durationWeeks} semanas</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-sm">Semana {String(currentWeek).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="bg-surface-container-high p-4 rounded-lg flex items-center gap-6 mt-5">
              <div className="flex flex-col items-center flex-1">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Total Gasto</span>
                <span className="text-2xl font-[family-name:var(--font-headline)] font-bold tabular-nums">
                  14.2k <span className="text-xs font-normal text-on-surface-variant">kcal</span>
                </span>
              </div>
              <div className="h-10 w-px bg-outline-variant/30" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Treinos</span>
                <span className="text-2xl font-[family-name:var(--font-headline)] font-bold tabular-nums text-primary">
                  24 <span className="text-xs font-normal text-on-surface">/ {totalSessions}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero — matches reference layout with stats on right */}
      <header className="hidden lg:flex mb-12 flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-primary-fixed font-[family-name:var(--font-headline)] font-bold tracking-widest text-sm uppercase">
            PROGRAMA ATUAL
          </h2>
          <h1 className="text-6xl font-[family-name:var(--font-headline)] font-black tracking-tighter uppercase leading-none">
            {program.name}
          </h1>
          {program.description && (
            <p className="text-on-surface-variant font-[family-name:var(--font-body)] text-lg max-w-xl">
              {program.description}
            </p>
          )}
        </div>
        <div className="flex gap-8 border-l border-outline-variant/30 pl-8 flex-shrink-0">
          <div className="text-right">
            <span className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">DURAÇÃO</span>
            <span className="text-4xl font-[family-name:var(--font-headline)] font-light tracking-tight tabular-nums">
              {program.durationWeeks} <span className="text-xl">WKS</span>
            </span>
          </div>
          <div className="text-right">
            <span className="block text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">SESSÕES</span>
            <span className="text-4xl font-[family-name:var(--font-headline)] font-light tracking-tight tabular-nums">
              08/{totalSessions}
            </span>
          </div>
        </div>
      </header>

      {/* ===================== PHASE TIMELINE (Mobile) ===================== */}
      <section className="mb-12 lg:hidden overflow-x-auto pb-4 no-scrollbar">
        <div className="flex items-center gap-3 min-w-max">
          {program.phases.map((phase, i) => {
            const isCurrent = i === currentPhaseIndex
            const isPast = i < currentPhaseIndex
            return (
              <div key={phase.id} className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-3 px-5 py-3 rounded-full ${
                    !isCurrent && !isPast ? 'opacity-60' : ''
                  }`}
                  style={{
                    backgroundColor: isCurrent ? `${phase.color}18` : '#201f1f',
                    border: `1px solid ${isCurrent ? phase.color : 'transparent'}20`,
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isCurrent ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: phase.color }}
                  />
                  <span
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: phase.color }}
                  >
                    {phase.name}
                  </span>
                </div>
                {i < program.phases.length - 1 && (
                  <div className="w-8 h-px bg-outline-variant/30" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ===================== PHASE TIMELINE (Desktop) ===================== */}
      <section className="hidden lg:block mb-12 bg-surface-container-low p-1 rounded-xl">
        <div className="flex items-center justify-between p-2">
          {program.phases.map((phase, i) => {
            const isCurrent = i === currentPhaseIndex
            const isPast = i < currentPhaseIndex
            const progress = isCurrent ? ((currentWeek - phase.weekStart) / (phase.weekEnd - phase.weekStart + 1)) : isPast ? 1 : 0
            return (
              <div
                key={phase.id}
                className={`flex-1 px-6 py-4 rounded-lg ${
                  isCurrent
                    ? 'bg-surface-container-high border-b-2 border-primary'
                    : 'hover:bg-surface-container-high transition-colors'
                } ${!isCurrent && !isPast ? `opacity-${isPast ? '100' : '30'}` : ''}`}
                style={{ opacity: isCurrent ? 1 : isPast ? 0.7 : 0.4 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-[family-name:var(--font-headline)] font-bold tracking-widest uppercase ${isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}>
                    Fase {String(i + 1).padStart(2, '0')}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-tighter">
                      Em Progresso
                    </span>
                  )}
                  {!isCurrent && !isPast && (
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">lock</span>
                  )}
                </div>
                <h3 className={`text-xl font-[family-name:var(--font-headline)] font-bold ${isCurrent ? 'text-white' : 'text-on-surface-variant'}`}>
                  {phase.name.toUpperCase()}
                </h3>
                <div className="mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  {progress > 0 && (
                    <div
                      className="h-full bg-primary shadow-[0_0_8px_rgba(255,142,128,0.5)]"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===================== DESKTOP: Section Header ===================== */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <h2 className="text-3xl font-[family-name:var(--font-headline)] font-black uppercase tracking-tighter">
          Sessões Disponíveis
        </h2>
        <div className="flex gap-2">
          <button className="p-2 border border-outline-variant/20 rounded-md text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="p-2 border border-outline-variant/20 rounded-md text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      {/* ===================== WORKOUT CARDS ===================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWorkouts.map((workout, i) => (
          <div
            key={workout.id}
            className="animate-stagger-in"
            style={{ '--i': i } as React.CSSProperties}
          >
            <WorkoutCard
              id={workout.id}
              name={workout.name}
              icon={workout.icon}
              exerciseCount={workout.exerciseCount}
              muscleGroups={workout.muscleGroups}
              phaseColor={currentPhase?.color}
              orderIndex={workout.orderIndex}
              isFirst={i === 0}
            />
          </div>
        ))}

        {/* Rest & Recovery card */}
        <div className="group relative overflow-hidden bg-surface-container-low border border-outline-variant/10 rounded-xl opacity-60">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          <div className="p-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1 block">
              {String.fromCharCode(65 + sortedWorkouts.length)} - Mobility
            </span>
            <h3 className="text-3xl font-[family-name:var(--font-headline)] font-bold uppercase tracking-tight mb-6">
              Rest &amp; Recovery
            </h3>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant">timer</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recuperação ativa</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FATIGUE HEATMAP ===================== */}
      <section className="mt-16">
        <h4 className="font-[family-name:var(--font-headline)] font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-primary" />
          Status de Fadiga Muscular
        </h4>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {[
            { label: 'Peito', intensity: 1.0 },
            { label: 'Ombros', intensity: 0.8 },
            { label: 'Triceps', intensity: 0.7 },
            { label: 'Costas', intensity: 0 },
            { label: 'Biceps', intensity: 0 },
            { label: 'Pernas', intensity: 0 },
            { label: 'Gluteos', intensity: 0 },
            { label: 'Core', intensity: 0 },
            { label: 'Quadriceps', intensity: 0.4 },
            { label: 'Posterior', intensity: 0 },
            { label: 'Panturrilha', intensity: 0 },
            { label: 'Antebraco', intensity: 0 },
          ].map((muscle, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm relative flex items-end p-1"
              style={{
                backgroundColor: muscle.intensity > 0 ? '#ff8e80' : '#262626',
                opacity: muscle.intensity > 0 ? Math.max(muscle.intensity, 0.4) : 1,
              }}
              title={`${muscle.label}: ${Math.round(muscle.intensity * 100)}%`}
            >
              <span className="text-[5px] md:text-[6px] font-black uppercase leading-none">
                {muscle.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ANALYTICS BENTO (Desktop) ===================== */}
      <section className="hidden lg:grid mt-16 grid-cols-4 gap-6">
        <div className="col-span-2 glass-panel p-8 rounded-xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
            <h4 className="font-[family-name:var(--font-headline)] font-bold uppercase tracking-widest text-sm">Saturação de Volume</h4>
          </div>
          <div className="flex gap-1 h-32 items-end">
            {[50, 66, 33, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-surface-container-highest rounded-sm relative">
                <div className="absolute bottom-0 w-full bg-primary/20" style={{ height: `${h}%` }} />
                <div className="absolute bottom-0 w-full bg-primary" style={{ height: `${h / 2}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant tracking-tighter">
            <span>PEITO</span><span>COSTAS</span><span>PERNAS</span><span>BRACOS</span><span>OMBRO</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5">
          <h4 className="font-[family-name:var(--font-headline)] font-bold uppercase tracking-widest text-xs text-on-surface-variant mb-4">Próximo Repouso</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-[family-name:var(--font-headline)] font-black text-white tabular-nums">48</span>
            <span className="text-xl font-[family-name:var(--font-headline)] font-bold text-primary">HRS</span>
          </div>
          <p className="mt-4 text-xs font-[family-name:var(--font-body)] text-on-surface-variant leading-relaxed">
            Janela de recuperação otimizada com base no volume das últimas 72h.
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 flex flex-col justify-between">
          <div>
            <h4 className="font-[family-name:var(--font-headline)] font-bold uppercase tracking-widest text-xs text-on-surface-variant mb-2">Progresso</h4>
            <span className="text-4xl font-[family-name:var(--font-headline)] font-black text-white tabular-nums">16%</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span>Total Geral</span>
              <span className="text-primary">08/{totalSessions}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[16%] shadow-[0_0_8px_rgba(255,142,128,0.4)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FLOATING FAB (Desktop) ===================== */}
      <button className="hidden lg:flex fixed bottom-8 right-8 w-16 h-16 kinetic-gradient rounded-full shadow-[0_8px_32px_rgba(255,59,48,0.3)] items-center justify-center text-black active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
      </button>
    </div>
  )
}
