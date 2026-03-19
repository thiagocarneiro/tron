'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import api from '@/api/client'
import { ExerciseCard } from '@/components/student/ExerciseCard'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'

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
        .then(res => setWorkout(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleStartSession = async () => {
    if (!workout) return
    setStartingSession(true)
    try {
      // Get current phase week
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
        <p className="text-[#a0a0a0]">Treino não encontrado</p>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-[#1a1a1a] p-4 z-10 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{workout.icon}</span>
              <h1 className="text-lg font-bold font-[family-name:var(--font-heading)]">{workout.name}</h1>
            </div>
            {workout.currentPhase && (
              <Badge color={workout.currentPhase.color} size="sm" className="mt-1">
                {workout.currentPhase.name} (Sem. {workout.currentPhase.weekStart}–{workout.currentPhase.weekEnd})
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="p-4 space-y-3">
        {workout.exercises
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(exercise => (
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
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] to-transparent pt-8">
        <Button
          fullWidth
          size="lg"
          loading={startingSession}
          onClick={handleStartSession}
          className="shadow-lg shadow-red-500/20"
        >
          <Play size={20} />
          Iniciar Treino
        </Button>
      </div>
    </div>
  )
}
