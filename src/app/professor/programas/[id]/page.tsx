'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Play } from 'lucide-react'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/formatters'

interface ProgramPhase {
  id: string; name: string; description: string; color: string; weekStart: number; weekEnd: number; orderIndex: number
}
interface WorkoutExercise {
  id: string; orderIndex: number; name?: string; muscleGroups?: string[]
  exercise?: { name: string; muscleGroups: string[]; videoUrl: string | null }
}
interface ProgramWorkout {
  id: string; name: string; icon: string; orderIndex: number
  exercises?: WorkoutExercise[]
}
interface RotationSlot {
  dayOfWeek: number; displayLabel: string; isRest: boolean
}
interface ProgramRotation {
  id: string; label: string; slots: RotationSlot[]
}
interface ProgramTip {
  id: string; icon: string; title: string; text: string
}
interface ProgramDetail {
  name: string; description: string | null; durationWeeks: number
  phases: ProgramPhase[]; workouts: ProgramWorkout[]
  rotations?: ProgramRotation[]; tips?: ProgramTip[]
}

export default function ProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      api.get(`/trainer/programs/${params.id}`)
        .then(r => setProgram(r.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [params.id])

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={36} height={36} />
        <div>
          <Skeleton width={200} height={24} />
          <Skeleton width={100} height={14} className="mt-1" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={80} />
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rectangular" height={90} />)}
      </div>
    </div>
  )
  if (!program) return <div className="p-8 text-center text-white/35">Programa não encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-md">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-heading)] uppercase tracking-wider">{program.name}</h1>
          <p className="text-sm text-white/35">{program.durationWeeks} semanas</p>
        </div>
      </div>

      {program.description && (
        <p className="text-white/60">{program.description}</p>
      )}

      {/* Phases */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 font-[family-name:var(--font-heading)] uppercase tracking-wider">Fases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(program.phases || []).sort((a, b) => a.orderIndex - b.orderIndex).map((phase) => (
            <div key={phase.id} className="bg-[#131313] rounded-md p-4" style={{ borderLeftColor: phase.color, borderLeftWidth: 4, borderLeftStyle: 'solid' }}>
              <p className="font-medium text-white">{phase.name}</p>
              <p className="text-sm text-white/35">Semanas {phase.weekStart}–{phase.weekEnd}</p>
              <p className="text-xs text-white/35 mt-2">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workouts */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 font-[family-name:var(--font-heading)] uppercase tracking-wider">Treinos</h2>
        <div className="space-y-3">
          {(program.workouts || []).sort((a, b) => a.orderIndex - b.orderIndex).map((workout) => (
            <div key={workout.id} className="bg-[#131313] rounded-md overflow-hidden">
              <button
                onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5"
              >
                <span className="text-2xl">{workout.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-white">{workout.name}</p>
                  <p className="text-sm text-white/35">{workout.exercises?.length || 0} exercícios</p>
                </div>
                <ChevronDown size={18} className={cn('text-white/35 transition-transform', expandedWorkout === workout.id && 'rotate-180')} />
              </button>

              {expandedWorkout === workout.id && workout.exercises && (
                <div className="p-4 space-y-2">
                  {workout.exercises.sort((a, b) => a.orderIndex - b.orderIndex).map((ex, i) => (
                    <div key={ex.id} className="flex items-center gap-3 py-2">
                      <span className="w-6 h-6 bg-[#201f1f] rounded-full flex items-center justify-center text-xs text-white/35">{i+1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{ex.exercise?.name || ex.name}</p>
                        <p className="text-xs text-white/35">
                          {ex.exercise?.muscleGroups?.join(', ') || ex.muscleGroups?.join(', ')}
                        </p>
                      </div>
                      {ex.exercise?.videoUrl && (
                        <a href={ex.exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">
                          <Play size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rotations */}
      {(program.rotations?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 font-[family-name:var(--font-heading)] uppercase tracking-wider">Rotações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {program.rotations!.map((rotation) => (
              <div key={rotation.id} className="bg-[#131313] rounded-md p-4">
                <p className="font-medium text-white mb-2">{rotation.label}</p>
                <div className="grid grid-cols-7 gap-1">
                  {(rotation.slots || []).sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((slot, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[10px] text-white/35 mb-1">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][slot.dayOfWeek]}</p>
                      <div className={`py-1 rounded-md text-xs font-medium ${slot.isRest ? 'bg-[#201f1f] text-white/35' : 'bg-red-500/10 text-red-400'}`}>
                        {slot.displayLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {(program.tips?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 font-[family-name:var(--font-heading)] uppercase tracking-wider">Dicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {program.tips!.map((tip) => (
              <div key={tip.id} className="bg-[#131313] rounded-md p-4 flex gap-3">
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <p className="font-medium text-white text-sm">{tip.title}</p>
                  <p className="text-xs text-white/35 mt-0.5">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
