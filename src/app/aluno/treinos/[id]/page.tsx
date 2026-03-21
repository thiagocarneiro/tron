'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/api/client'
import { ExerciseCard } from '@/components/student/ExerciseCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface WorkoutDetail {
  id: string
  name: string
  icon: string
  exercises: {
    id: string
    workoutExerciseId: string
    name: string
    equipmentOptions: string | null
    muscleGroups: string[]
    videoUrl: string | null
    orderIndex: number
    hasWarmup: boolean
    warmupConfig: { sets: number; reps: string; note: string } | null
    feeder1Config: { reps: string; rest: string } | null
    feeder2Config: { reps: string; rest: string } | null
    workingSetConfig: {
      type: string; sets?: number; reps?: string; rest?: string
      blocks?: number | string; repsPerBlock?: string; intraRest?: string; duration?: string
    }
    backoffConfig: { reps: string; rest: string } | null
  }[]
  currentPhase: {
    name: string
    color: string
    weekStart: number
    weekEnd: number
  }
}

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingSession, setStartingSession] = useState(false)

  useEffect(() => {
    if (params.id) {
      api.get(`/student/workouts/${params.id}`)
        .then(res => {
          const data = res.data
          setWorkout({
            ...data,
            exercises: (data.exercises || []).map((we: Record<string, unknown>) => {
              const ex = we.exercise as Record<string, unknown> || {}
              const phaseConfig = we.phaseConfig as Record<string, unknown> | null
              return {
                id: ex.id,
                workoutExerciseId: we.id,
                name: ex.name,
                equipmentOptions: ex.equipmentOptions,
                muscleGroups: ex.muscleGroups || [],
                videoUrl: ex.videoUrl,
                orderIndex: we.orderIndex,
                hasWarmup: we.hasWarmup,
                warmupConfig: we.warmupConfig,
                feeder1Config: we.feeder1Config,
                feeder2Config: we.feeder2Config,
                workingSetConfig: phaseConfig?.workingSetConfig || { type: 'straight', sets: 3, reps: '8-10', rest: '2min' },
                backoffConfig: phaseConfig?.backoffConfig || null,
              }
            }),
          })
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleStartSession = async () => {
    if (!workout) return
    setStartingSession(true)
    try {
      const phaseRes = await api.get('/student/program/phase')
      const { data: session } = await api.post('/student/sessions', {
        workoutId: workout.id,
        phaseWeek: phaseRes.data.currentWeek,
      })
      router.push(`/aluno/sessao/${session.id}`)
    } catch (err) {
      console.error(err)
      setStartingSession(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton width="60%" height={28} />
        <Skeleton width="40%" height={20} />
        {[1,2,3,4].map(i => (
          <Skeleton key={i} variant="rectangular" height={80} className="w-full" />
        ))}
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="p-4 pt-12 text-center">
        <p className="text-on-surface-variant">Treino nao encontrado</p>
      </div>
    )
  }

  const sortedExercises = [...workout.exercises].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="bg-background text-on-background font-[family-name:var(--font-body)]">
      {/* Sticky Workout Header (Sub-Header) */}
      <div className="sticky top-16 lg:top-0 z-40 bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-primary/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-primary active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/15">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-headline)] font-bold text-xl uppercase tracking-tight">
              {workout.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {workout.currentPhase && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase"
                  style={{
                    backgroundColor: `${workout.currentPhase.color}20`,
                    color: workout.currentPhase.color,
                  }}
                >
                  {workout.currentPhase.name}
                </span>
              )}
              <span className="text-on-surface-variant text-xs font-medium">
                {sortedExercises.length} exercicios
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <main className="pt-4 pb-32 px-4 space-y-4">
        <section className="space-y-4">
          {sortedExercises.map(exercise => (
            <ExerciseCard
              key={exercise.workoutExerciseId}
              name={exercise.name}
              equipmentOptions={exercise.equipmentOptions}
              muscleGroups={exercise.muscleGroups}
              videoUrl={exercise.videoUrl}
              hasWarmup={exercise.hasWarmup}
              warmupConfig={exercise.warmupConfig}
              feeder1Config={exercise.feeder1Config}
              feeder2Config={exercise.feeder2Config}
              workingSetConfig={exercise.workingSetConfig}
              backoffConfig={exercise.backoffConfig}
              orderIndex={exercise.orderIndex}
            />
          ))}
        </section>

        {/* Muscle Intensity Heatmap */}
        <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <h4 className="font-[family-name:var(--font-headline)] font-bold text-sm uppercase tracking-widest mb-4">
            Mapa de Intensidade Muscular
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-12 bg-primary rounded-sm flex items-end p-1">
              <span className="text-[8px] font-black uppercase text-on-primary">Peito</span>
            </div>
            <div className="h-12 bg-primary-container rounded-sm flex items-end p-1">
              <span className="text-[8px] font-black uppercase text-on-primary-container">Ombro</span>
            </div>
            <div className="h-12 bg-secondary-container rounded-sm flex items-end p-1">
              <span className="text-[8px] font-black uppercase text-on-secondary-container">Tri</span>
            </div>
            <div className="h-12 bg-surface-container-highest rounded-sm flex items-end p-1 opacity-40">
              <span className="text-[8px] font-black uppercase text-on-surface-variant">Pernas</span>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 w-full p-4 bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-[#FF3B30]/10 z-50 lg:bottom-0">
        <button
          disabled={startingSession}
          onClick={handleStartSession}
          className="w-full kinetic-gradient h-16 rounded-lg flex items-center justify-center gap-3 active:scale-95 duration-200 shadow-[0_0_30px_rgba(255,59,48,0.3)] group disabled:opacity-60"
        >
          {startingSession ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
          ) : (
            <>
              <span className="material-symbols-outlined text-white text-2xl group-hover:animate-pulse">play_arrow</span>
              <span className="font-[family-name:var(--font-headline)] font-black text-white text-lg uppercase tracking-tighter italic">
                Iniciar Treino
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
