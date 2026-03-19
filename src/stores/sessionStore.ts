import { create } from 'zustand'
import type { SessionSetData } from '@/types'

interface SessionState {
  activeSessionId: string | null
  currentExerciseIndex: number
  sets: Record<string, SessionSetData[]> // keyed by workoutExerciseId
  restTimerEnd: number | null
  restTimerDuration: number
  isTimerRunning: boolean

  startSession: (sessionId: string) => void
  endSession: () => void
  setCurrentExercise: (index: number) => void
  addSet: (workoutExerciseId: string, set: SessionSetData) => void
  updateSet: (workoutExerciseId: string, setIndex: number, data: Partial<SessionSetData>) => void
  startRestTimer: (durationSeconds: number) => void
  stopRestTimer: () => void
  clearSets: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  activeSessionId: null,
  currentExerciseIndex: 0,
  sets: {},
  restTimerEnd: null,
  restTimerDuration: 0,
  isTimerRunning: false,

  startSession: (sessionId) =>
    set({ activeSessionId: sessionId, currentExerciseIndex: 0, sets: {} }),

  endSession: () =>
    set({ activeSessionId: null, currentExerciseIndex: 0, sets: {}, restTimerEnd: null, isTimerRunning: false }),

  setCurrentExercise: (index) =>
    set({ currentExerciseIndex: index }),

  addSet: (workoutExerciseId, setData) =>
    set((state) => ({
      sets: {
        ...state.sets,
        [workoutExerciseId]: [...(state.sets[workoutExerciseId] || []), setData],
      },
    })),

  updateSet: (workoutExerciseId, setIndex, data) =>
    set((state) => {
      const existing = state.sets[workoutExerciseId] || []
      const updated = [...existing]
      if (updated[setIndex]) {
        updated[setIndex] = { ...updated[setIndex], ...data }
      }
      return { sets: { ...state.sets, [workoutExerciseId]: updated } }
    }),

  startRestTimer: (durationSeconds) =>
    set({ restTimerEnd: Date.now() + durationSeconds * 1000, restTimerDuration: durationSeconds, isTimerRunning: true }),

  stopRestTimer: () =>
    set({ restTimerEnd: null, isTimerRunning: false }),

  clearSets: () =>
    set({ sets: {} }),
}))
