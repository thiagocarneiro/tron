'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Dumbbell } from 'lucide-react'
import api from '@/api/client'
import { WorkoutCard } from '@/components/student/WorkoutCard'
import { WorkoutCardSkeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/formatters'
import { getCurrentWeek, getPhaseForWeek } from '@/utils/formatters'

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
      .then(res => setProgram(res.data))
      .catch(err => setError(err.response?.data?.error || 'Erro ao carregar programa'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProgram() }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-4 safe-top animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#1a1a1a] rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-28 h-16 bg-[#1a1a1a] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <WorkoutCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 pt-16 text-center safe-top animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Dumbbell size={28} className="text-red-400" />
        </div>
        <p className="text-white font-medium mb-1">Erro ao carregar</p>
        <p className="text-sm text-[#666] mb-4">{error}</p>
        <button
          onClick={loadProgram}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-white rounded-xl text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="p-4 safe-top animate-fade-in">
        <EmptyState
          icon={Dumbbell}
          title="Nenhum programa ativo"
          description="Peça ao seu professor para atribuir um programa de treino."
        />
      </div>
    )
  }

  const currentWeek = program.startDate ? getCurrentWeek(new Date(program.startDate)) : 1
  const currentPhaseIndex = getPhaseForWeek(currentWeek) - 1
  const currentPhase = program.phases[currentPhaseIndex]

  return (
    <div className="p-4 space-y-5 safe-top animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Meus Treinos</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge color={currentPhase?.color || '#FF3B30'} size="md">
            Semana {currentWeek} de {program.durationWeeks}
          </Badge>
          <span className="text-sm text-[#a0a0a0]">{currentPhase?.name}</span>
        </div>
      </div>

      {/* Phase chips - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {program.phases.map((phase, i) => (
          <div
            key={phase.id}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300',
              i === currentPhaseIndex
                ? 'border-transparent text-white shadow-lg'
                : 'border-[#2a2a2a] text-[#555] bg-[#1a1a1a] hover:bg-[#1f1f1f]'
            )}
            style={i === currentPhaseIndex ? {
              backgroundColor: phase.color,
              boxShadow: `0 4px 20px ${phase.color}40`,
            } : undefined}
          >
            <div className="whitespace-nowrap">{phase.name}</div>
            <div className="text-xs opacity-70 whitespace-nowrap">Sem. {phase.weekStart}–{phase.weekEnd}</div>
          </div>
        ))}
      </div>

      {/* Workout cards */}
      <div className="space-y-3">
        {program.workouts
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((workout, i) => (
            <div
              key={workout.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
            >
              <WorkoutCard
                id={workout.id}
                name={workout.name}
                icon={workout.icon}
                exerciseCount={workout.exerciseCount}
                muscleGroups={workout.muscleGroups}
              />
            </div>
          ))}
      </div>

      {/* Program description */}
      {program.description && (
        <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
          <p className="text-sm text-[#a0a0a0]">{program.description}</p>
        </div>
      )}
    </div>
  )
}
