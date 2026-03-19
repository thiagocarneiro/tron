'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Play, X, WifiOff } from 'lucide-react'
import api from '@/api/client'
import { SetRow } from '@/components/student/SetRow'
import { RestTimer } from '@/components/student/RestTimer'
import { SessionSummary } from '@/components/student/SessionSummary'
import { PRCelebration } from '@/components/student/PRCelebration'
import { useRestTimer } from '@/hooks/useRestTimer'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { cn, parseRestTime } from '@/utils/formatters'

// Proper types instead of `any`
interface SetConfig {
  sets?: number
  blocks?: number
  reps?: string | number
  repsPerBlock?: string | number
  rest?: string
  intraRest?: string
}

interface SessionExercise {
  id?: string
  workoutExerciseId: string
  name: string
  equipmentOptions: string | null
  muscleGroups: string[]
  videoUrl: string | null
  orderIndex: number
  hasWarmup: boolean
  warmupConfig: SetConfig | null
  feeder1Config: SetConfig | null
  feeder2Config: SetConfig | null
  workingSetConfig: SetConfig | null
  backoffConfig: SetConfig | null
}

interface SetData {
  id?: string
  setType: string
  setNumber: number
  weight: number | string
  reps: number | string
  completed: boolean
  targetReps: string
  restSeconds: number
  previousWeight: number | null
  previousReps: number | null
}

interface HistorySet {
  weight: number
  reps: number
}

interface NewPR {
  exerciseName: string
  weight: number
  reps: number
}

export default function ActiveSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const { showToast } = useToast()
  const { isOnline } = useOfflineSync()

  const [exercises, setExercises] = useState<SessionExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sets, setSets] = useState<Record<string, SetData[]>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [sessionStart] = useState(Date.now())
  const [showSummary, setShowSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newPRs, setNewPRs] = useState<NewPR[]>([])
  const [celebratingPR, setCelebratingPR] = useState<NewPR | null>(null)

  const restTimer = useRestTimer()
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Load session data with AbortController
  useEffect(() => {
    const controller = new AbortController()

    async function loadSession() {
      try {
        const { data: session } = await api.get(`/student/sessions/${sessionId}`)
        const { data: workout } = await api.get(`/student/workouts/${session.workoutId}`)

        if (!mountedRef.current) return

        const exerciseList: SessionExercise[] = workout.exercises || []
        setExercises(exerciseList)

        // Initialize sets for each exercise
        const initialSets: Record<string, SetData[]> = {}
        const prevData: Record<string, HistorySet[]> = {}

        for (const exercise of exerciseList) {
          const weId = exercise.workoutExerciseId
          const exerciseSets: SetData[] = []

          // Load previous session data
          try {
            const { data: history } = await api.get(`/student/exercises/${exercise.id || weId}/history?limit=1`)
            if (history?.length > 0 && history[0].sets) {
              prevData[weId] = history[0].sets.map((s: HistorySet) => ({ weight: s.weight, reps: s.reps }))
            }
          } catch { /* ignore history errors */ }

          if (!mountedRef.current) return

          let setNum = 0

          // Warmup sets
          if (exercise.hasWarmup && exercise.warmupConfig) {
            const warmupSets = exercise.warmupConfig.sets || 2
            for (let i = 0; i < warmupSets; i++) {
              exerciseSets.push({
                setType: 'WARMUP', setNumber: i + 1,
                weight: '', reps: '', completed: false,
                targetReps: String(exercise.warmupConfig.reps || '15-20'),
                restSeconds: 60,
                previousWeight: prevData[weId]?.[setNum]?.weight ?? null,
                previousReps: prevData[weId]?.[setNum]?.reps ?? null,
              })
              setNum++
            }
          }

          // Feeder 1
          if (exercise.feeder1Config) {
            exerciseSets.push({
              setType: 'FEEDER_1', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.feeder1Config.reps || '5-6'),
              restSeconds: parseRestTime(exercise.feeder1Config.rest || '1min'),
              previousWeight: prevData[weId]?.[setNum]?.weight ?? null,
              previousReps: prevData[weId]?.[setNum]?.reps ?? null,
            })
            setNum++
          }

          // Feeder 2
          if (exercise.feeder2Config) {
            exerciseSets.push({
              setType: 'FEEDER_2', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.feeder2Config.reps || '5-6'),
              restSeconds: parseRestTime(exercise.feeder2Config.rest || '1-2min'),
              previousWeight: prevData[weId]?.[setNum]?.weight ?? null,
              previousReps: prevData[weId]?.[setNum]?.reps ?? null,
            })
            setNum++
          }

          // Working Sets
          if (exercise.workingSetConfig) {
            const config = exercise.workingSetConfig
            const workingSets = config.sets || config.blocks || 2
            const numSets = typeof workingSets === 'string' ? parseInt(workingSets) : workingSets
            const targetReps = config.reps || config.repsPerBlock || '8-10'
            const restTime = config.rest || config.intraRest || '2-3min'

            for (let i = 0; i < numSets; i++) {
              exerciseSets.push({
                setType: 'WORKING', setNumber: i + 1,
                weight: '', reps: '', completed: false,
                targetReps: String(targetReps),
                restSeconds: parseRestTime(restTime),
                previousWeight: prevData[weId]?.[setNum]?.weight ?? null,
                previousReps: prevData[weId]?.[setNum]?.reps ?? null,
              })
              setNum++
            }
          }

          // Backoff Set
          if (exercise.backoffConfig) {
            exerciseSets.push({
              setType: 'BACKOFF', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.backoffConfig.reps || '10-12'),
              restSeconds: parseRestTime(exercise.backoffConfig.rest || '1-2min'),
              previousWeight: prevData[weId]?.[setNum]?.weight ?? null,
              previousReps: prevData[weId]?.[setNum]?.reps ?? null,
            })
          }

          initialSets[weId] = exerciseSets
        }

        if (mountedRef.current) {
          setSets(initialSets)
        }
      } catch {
        if (mountedRef.current) setLoadError(true)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    loadSession()
    return () => controller.abort()
  }, [sessionId])

  // Current exercise
  const currentExercise = exercises[currentIndex]
  const currentSets = currentExercise ? sets[currentExercise.workoutExerciseId] || [] : []

  // Memoized calculations
  const { totalSets, completedSets, progress } = useMemo(() => {
    const allSets = Object.values(sets).flat()
    const total = allSets.length
    const completed = allSets.filter(s => s.completed).length
    return { totalSets: total, completedSets: completed, progress: total > 0 ? completed / total : 0 }
  }, [sets])

  const totalVolume = useMemo(() => {
    return Object.values(sets).flat()
      .filter(s => s.completed)
      .reduce((total, s) => {
        const w = typeof s.weight === 'string' ? parseFloat(s.weight) || 0 : (s.weight || 0)
        const r = typeof s.reps === 'string' ? parseInt(String(s.reps)) || 0 : (s.reps || 0)
        return total + w * r
      }, 0)
  }, [sets])

  const exercisesCompleted = useMemo(() => {
    return exercises.filter(ex => {
      const exSets = sets[ex.workoutExerciseId] || []
      return exSets.length > 0 && exSets.every(s => s.completed)
    }).length
  }, [exercises, sets])

  // Handle set completion
  const handleCompleteSet = useCallback(async (exerciseWeId: string, setIndex: number) => {
    const currentSetData = sets[exerciseWeId]?.[setIndex]
    if (!currentSetData || currentSetData.completed) return

    const weight = typeof currentSetData.weight === 'string' ? parseFloat(currentSetData.weight) : currentSetData.weight
    const reps = typeof currentSetData.reps === 'string' ? parseInt(String(currentSetData.reps)) : currentSetData.reps

    // Mark as completed locally
    setSets(prev => {
      const updated = { ...prev }
      updated[exerciseWeId] = [...(updated[exerciseWeId] || [])]
      updated[exerciseWeId][setIndex] = { ...updated[exerciseWeId][setIndex], completed: true }
      return updated
    })

    // Send to API
    try {
      await api.post(`/student/sessions/${sessionId}/sets`, {
        workoutExerciseId: exerciseWeId,
        setType: currentSetData.setType,
        setNumber: currentSetData.setNumber,
        weight: weight || null,
        reps: reps || null,
        completed: true,
      })
    } catch {
      showToast('Erro ao salvar set — será sincronizado depois', 'error')
    }

    // Start rest timer
    if (currentSetData.restSeconds > 0) {
      restTimer.start(currentSetData.restSeconds)
    }

    // Vibrate lightly
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [sets, sessionId, restTimer, showToast])

  // Handle weight/reps change
  const handleSetChange = useCallback((exerciseWeId: string, setIndex: number, field: 'weight' | 'reps', value: number | string) => {
    setSets(prev => {
      const updated = { ...prev }
      updated[exerciseWeId] = [...(updated[exerciseWeId] || [])]
      updated[exerciseWeId][setIndex] = { ...updated[exerciseWeId][setIndex], [field]: value }
      return updated
    })
  }, [])

  // Navigate exercises
  const goNext = useCallback(() => {
    if (currentIndex < exercises.length - 1) setCurrentIndex(currentIndex + 1)
  }, [currentIndex, exercises.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }, [currentIndex])

  // Finish session
  const handleSubmitSummary = useCallback(async (data: { rating: number; rpe: number; notes: string }) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const duration = Math.round((Date.now() - sessionStart) / 1000)
      const response = await api.put(`/student/sessions/${sessionId}`, {
        completedAt: new Date().toISOString(),
        duration,
        rating: data.rating || null,
        rpe: data.rpe || null,
        notes: data.notes || null,
      })

      if (response.data.newPRs?.length > 0) {
        setNewPRs(response.data.newPRs)
      }

      showToast('Treino finalizado com sucesso!', 'success')
      router.replace('/aluno/treinos')
    } catch {
      showToast('Erro ao finalizar treino', 'error')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, sessionStart, sessionId, router, showToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto" />
          <p className="text-[#a0a0a0] mt-4">Carregando treino...</p>
        </div>
      </div>
    )
  }

  if (loadError || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <p className="text-[#a0a0a0] mb-4">{loadError ? 'Erro ao carregar treino' : 'Nenhum exercício encontrado'}</p>
          <Button variant="outline" onClick={() => router.replace('/aluno/treinos')}>Voltar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] safe-top">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-amber-400 text-xs animate-slide-down">
          <WifiOff size={14} />
          <span>Você está offline — sets serão salvos localmente</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-30 border-b border-[#1a1a1a]">
        {/* Progress bar */}
        <div className="h-1 bg-[#1a1a1a]">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-3">
          <button
            onClick={() => {
              if (confirm('Deseja sair do treino? O progresso salvo será mantido.')) {
                router.replace('/aluno/treinos')
              }
            }}
            className="p-2 hover:bg-[#1a1a1a] rounded-xl touch-target transition-colors"
            aria-label="Sair do treino"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <p className="text-xs text-[#666]">{completedSets}/{totalSets} sets</p>
            <p className="text-xs text-[#444]">{Math.round(progress * 100)}%</p>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowSummary(true)}>
            Finalizar
          </Button>
        </div>
      </div>

      {/* Exercise Navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors touch-target"
          aria-label="Exercício anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center flex-1">
          <p className="text-xs text-[#666] mb-1">Exercício {currentIndex + 1} de {exercises.length}</p>
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">{currentExercise.name}</h2>
          {currentExercise.equipmentOptions && (
            <p className="text-xs text-[#555] mt-0.5">{currentExercise.equipmentOptions}</p>
          )}
          {currentExercise.videoUrl && (
            <a
              href={currentExercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-red-400 mt-1 hover:text-red-300"
            >
              <Play size={12} /> Ver Vídeo
            </a>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={currentIndex === exercises.length - 1}
          className="p-2 rounded-xl hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors touch-target"
          aria-label="Próximo exercício"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Exercise pills navigation */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {exercises.map((ex, i) => {
          const exSets = sets[ex.workoutExerciseId] || []
          const allDone = exSets.length > 0 && exSets.every(s => s.completed)
          const someDone = exSets.some(s => s.completed)
          return (
            <button
              key={ex.workoutExerciseId}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Exercício ${i + 1}: ${ex.name}`}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all duration-200',
                i === currentIndex
                  ? 'bg-red-500 text-white scale-110'
                  : allDone
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : someDone
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#1a1a1a] text-[#555] border border-[#2a2a2a]'
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Sets List */}
      <div className="px-4 space-y-2 pb-32">
        {currentSets.map((set, i) => (
          <SetRow
            key={`${currentExercise.workoutExerciseId}-${set.setType}-${set.setNumber}`}
            setType={set.setType}
            setNumber={set.setNumber}
            targetReps={set.targetReps}
            previousWeight={set.previousWeight}
            previousReps={set.previousReps}
            weight={set.weight}
            reps={set.reps}
            completed={set.completed}
            onWeightChange={(v) => handleSetChange(currentExercise.workoutExerciseId, i, 'weight', v)}
            onRepsChange={(v) => handleSetChange(currentExercise.workoutExerciseId, i, 'reps', v)}
            onComplete={() => handleCompleteSet(currentExercise.workoutExerciseId, i)}
          />
        ))}
      </div>

      {/* Rest Timer */}
      <RestTimer
        timeLeft={restTimer.timeLeft}
        progress={restTimer.progress}
        isRunning={restTimer.isRunning}
        onSkip={restTimer.skip}
      />

      {/* PR Celebration */}
      {celebratingPR && (
        <PRCelebration
          exerciseName={celebratingPR.exerciseName}
          weight={celebratingPR.weight}
          reps={celebratingPR.reps}
          onClose={() => setCelebratingPR(null)}
        />
      )}

      {/* Session Summary */}
      <SessionSummary
        isOpen={showSummary}
        duration={Math.round((Date.now() - sessionStart) / 1000)}
        exercisesCompleted={exercisesCompleted}
        totalExercises={exercises.length}
        totalVolume={totalVolume}
        newPRs={newPRs}
        onSubmit={handleSubmitSummary}
        loading={submitting}
      />
    </div>
  )
}
