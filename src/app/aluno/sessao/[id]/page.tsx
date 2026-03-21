'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/api/client'
import { SetRow } from '@/components/student/SetRow'
import { RestTimer } from '@/components/student/RestTimer'
import { SessionSummary } from '@/components/student/SessionSummary'
import { PRCelebration } from '@/components/student/PRCelebration'
import { VideoPlayer } from '@/components/student/VideoPlayer'
import { useRestTimer } from '@/hooks/useRestTimer'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useToast } from '@/components/ui/Toast'
import { cn, parseRestTime } from '@/utils/formatters'

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

  // Load session data
  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      try {
        const { data: session } = await api.get(`/student/sessions/${sessionId}`)
        const { data: workout } = await api.get(`/student/workouts/${session.workoutId}`)

        if (cancelled) return

        const exerciseList: SessionExercise[] = (workout.exercises || []).map((we: Record<string, unknown>) => {
          const ex = we.exercise as Record<string, unknown> || {}
          const phaseConfig = we.phaseConfig as Record<string, unknown> | null
          return {
            id: ex.id as string,
            workoutExerciseId: we.id as string,
            name: ex.name as string,
            equipmentOptions: ex.equipmentOptions as string | null,
            muscleGroups: (ex.muscleGroups || []) as string[],
            videoUrl: ex.videoUrl as string | null,
            orderIndex: we.orderIndex as number,
            hasWarmup: we.hasWarmup as boolean,
            warmupConfig: we.warmupConfig as SetConfig | null,
            feeder1Config: we.feeder1Config as SetConfig | null,
            feeder2Config: we.feeder2Config as SetConfig | null,
            workingSetConfig: (phaseConfig?.workingSetConfig || { type: 'straight', sets: 3, reps: '8-10', rest: '2min' }) as SetConfig,
            backoffConfig: (phaseConfig?.backoffConfig || null) as SetConfig | null,
          }
        })
        setExercises(exerciseList)

        const initialSets: Record<string, SetData[]> = {}
        for (const exercise of exerciseList) {
          const weId = exercise.workoutExerciseId
          const exerciseSets: SetData[] = []

          if (exercise.hasWarmup && exercise.warmupConfig) {
            const warmupSets = exercise.warmupConfig.sets || 2
            for (let i = 0; i < warmupSets; i++) {
              exerciseSets.push({
                setType: 'WARMUP', setNumber: i + 1,
                weight: '', reps: '', completed: false,
                targetReps: String(exercise.warmupConfig.reps || '15-20'),
                restSeconds: 60,
                previousWeight: null, previousReps: null,
              })
            }
          }
          if (exercise.feeder1Config) {
            exerciseSets.push({
              setType: 'FEEDER_1', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.feeder1Config.reps || '5-6'),
              restSeconds: parseRestTime(exercise.feeder1Config.rest || '1min'),
              previousWeight: null, previousReps: null,
            })
          }
          if (exercise.feeder2Config) {
            exerciseSets.push({
              setType: 'FEEDER_2', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.feeder2Config.reps || '5-6'),
              restSeconds: parseRestTime(exercise.feeder2Config.rest || '1-2min'),
              previousWeight: null, previousReps: null,
            })
          }
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
                previousWeight: null, previousReps: null,
              })
            }
          }
          if (exercise.backoffConfig) {
            exerciseSets.push({
              setType: 'BACKOFF', setNumber: 1,
              weight: '', reps: '', completed: false,
              targetReps: String(exercise.backoffConfig.reps || '10-12'),
              restSeconds: parseRestTime(exercise.backoffConfig.rest || '1-2min'),
              previousWeight: null, previousReps: null,
            })
          }
          initialSets[weId] = exerciseSets
        }
        if (!cancelled) setSets(initialSets)
      } catch (err) {
        console.error('Session load error:', err)
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSession()
    return () => { cancelled = true }
  }, [sessionId])

  const currentExercise = exercises[currentIndex]
  const currentSets = currentExercise ? sets[currentExercise.workoutExerciseId] || [] : []

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

  const handleCompleteSet = useCallback(async (exerciseWeId: string, setIndex: number) => {
    const currentSetData = sets[exerciseWeId]?.[setIndex]
    if (!currentSetData || currentSetData.completed) return

    const weight = typeof currentSetData.weight === 'string' ? parseFloat(currentSetData.weight) : currentSetData.weight
    const reps = typeof currentSetData.reps === 'string' ? parseInt(String(currentSetData.reps)) : currentSetData.reps

    setSets(prev => {
      const updated = { ...prev }
      updated[exerciseWeId] = [...(updated[exerciseWeId] || [])]
      updated[exerciseWeId][setIndex] = { ...updated[exerciseWeId][setIndex], completed: true }
      return updated
    })

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
      showToast('Erro ao salvar set', 'error')
    }

    if (currentSetData.restSeconds > 0) {
      restTimer.start(currentSetData.restSeconds)
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [sets, sessionId, restTimer, showToast])

  const handleSetChange = useCallback((exerciseWeId: string, setIndex: number, field: 'weight' | 'reps', value: number | string) => {
    setSets(prev => {
      const updated = { ...prev }
      updated[exerciseWeId] = [...(updated[exerciseWeId] || [])]
      updated[exerciseWeId][setIndex] = { ...updated[exerciseWeId][setIndex], [field]: value }
      return updated
    })
  }, [])

  const goNext = useCallback(() => {
    if (currentIndex < exercises.length - 1) setCurrentIndex(currentIndex + 1)
  }, [currentIndex, exercises.length])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }, [currentIndex])

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
      <div className="min-h-screen flex items-center justify-center animate-fade-in bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" />
          <p className="text-on-surface-variant mt-4">Carregando treino...</p>
        </div>
      </div>
    )
  }

  if (loadError || !currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in bg-background">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">{loadError ? 'Erro ao carregar treino' : 'Nenhum exercicio encontrado'}</p>
          <button
            onClick={() => router.replace('/aluno/treinos')}
            className="px-4 py-2 bg-surface-container-high text-on-surface rounded-md text-sm hover:bg-surface-bright transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-[family-name:var(--font-body)]">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-error-container text-on-error-container py-2 px-4 text-center text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <span className="material-symbols-outlined text-sm">cloud_off</span>
          Voce esta offline
        </div>
      )}

      {/* Header */}
      <header className="bg-background text-[#FF3B30] font-[family-name:var(--font-headline)] font-bold uppercase tracking-tighter sticky top-0 w-full z-50 shadow-[0_4px_20px_rgba(255,59,48,0.1)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Deseja sair do treino? O progresso salvo sera mantido.')) {
                router.replace('/aluno/treinos')
              }
            }}
            className="active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
          <span className="text-xl font-black italic">TRON FITNESS</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] tracking-widest text-white/50 normal-case">PROGRESSO</span>
          <span className="text-sm font-[family-name:var(--font-headline)]">{Math.round(progress * 100)}% COMPLETE</span>
        </div>
      </header>

      {/* Session Progress Bar */}
      <div className="sticky top-16 left-0 w-full h-1 bg-surface-container-highest z-50">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Finalize button */}
      <div className="fixed top-20 right-6 z-40">
        <button
          onClick={() => setShowSummary(true)}
          className="bg-error-container hover:bg-error text-on-error-container hover:text-on-error px-4 py-2 rounded-full font-[family-name:var(--font-headline)] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors duration-300"
        >
          Finalizar
          <span className="material-symbols-outlined text-sm">flag</span>
        </button>
      </div>

      <main className="pt-4 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        {/* Navigation & Set Counter */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-headline)] text-3xl font-black uppercase tracking-tighter">
              SERIE {completedSets + 1}/{totalSets}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-md border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === exercises.length - 1}
                className="w-10 h-10 rounded-md border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Set Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {exercises.map((ex, i) => {
              const exSets = sets[ex.workoutExerciseId] || []
              const allDone = exSets.length > 0 && exSets.every(s => s.completed)
              const isCurrent = i === currentIndex
              return (
                <button
                  key={ex.workoutExerciseId}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md font-black text-xs transition-all',
                    isCurrent
                      ? 'border-2 border-primary text-primary ring-4 ring-primary/10'
                      : allDone
                        ? 'bg-white text-black'
                        : 'bg-surface-container-high text-on-surface-variant'
                  )}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Exercise Details Section */}
        <section className="mb-12">
          <div className="mb-8">
            <span className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase block mb-2">
              {(currentExercise.muscleGroups || []).join(' & ')}
            </span>
            <h1 className="font-[family-name:var(--font-headline)] text-4xl font-extrabold uppercase leading-none tracking-tighter">
              {currentExercise.name}
            </h1>
          </div>

          {/* Video Reference */}
          {currentExercise.videoUrl && (
            <div className="mb-10">
              <VideoPlayer url={currentExercise.videoUrl} title={currentExercise.name} />
            </div>
          )}

          {/* Sets List */}
          <div className="space-y-2 mb-12">
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

          {/* Rest Timer Section (inline, below sets) */}
          {!restTimer.isRunning && (
            <div className="bg-surface-container-low p-8 rounded-xl flex items-center justify-between border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mb-1">Descanso</span>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-bold uppercase tracking-tighter">Proxima Serie</h3>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" strokeWidth="6" />
                  <circle className="text-tertiary" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" strokeDasharray="226" strokeDashoffset="60" strokeWidth="6" />
                </svg>
                <span className="absolute font-[family-name:var(--font-headline)] text-xl font-black">--</span>
              </div>
            </div>
          )}
        </section>

        {/* Exercise History */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-4 rounded-lg">
            <span className="material-symbols-outlined text-primary-dim text-lg mb-2">history</span>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Ultimo Volume</p>
            <p className="font-[family-name:var(--font-headline)] text-lg font-bold tabular-nums">--</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-lg">
            <span className="material-symbols-outlined text-primary-dim text-lg mb-2">trending_up</span>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Carga Maxima</p>
            <p className="font-[family-name:var(--font-headline)] text-lg font-bold tabular-nums">--</p>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur-xl z-50 flex gap-4">
        <button
          onClick={goNext}
          className="flex-[1] h-14 bg-surface-container-highest text-on-surface font-[family-name:var(--font-headline)] font-black uppercase tracking-widest text-sm rounded-md active:scale-95 transition-all"
        >
          Pular
        </button>
        <button
          onClick={() => {
            const uncompletedIndex = currentSets.findIndex(s => !s.completed)
            if (uncompletedIndex >= 0) {
              handleCompleteSet(currentExercise.workoutExerciseId, uncompletedIndex)
            }
          }}
          className="flex-[2] h-14 kinetic-gradient text-on-primary-fixed font-[family-name:var(--font-headline)] font-black uppercase tracking-[0.2em] text-sm rounded-md active:scale-95 shadow-[0_4px_20px_rgba(255,142,128,0.3)] flex items-center justify-center gap-2"
        >
          Confirmar Serie
          <span className="material-symbols-outlined text-base">check_circle</span>
        </button>
      </footer>

      {/* Rest Timer Overlay */}
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
