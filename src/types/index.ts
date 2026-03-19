export type SetType = 'WARMUP' | 'FEEDER_1' | 'FEEDER_2' | 'WORKING' | 'BACKOFF'
export type Role = 'STUDENT' | 'TRAINER' | 'ADMIN'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type PhotoAngle = 'FRONT' | 'SIDE' | 'BACK'

export interface WorkingSetConfig {
  type: 'straight' | 'cluster' | 'isometric'
  sets?: number
  reps?: string
  rest?: string
  blocks?: number | string
  repsPerBlock?: string
  intraRest?: string
  duration?: string
}

export interface BackoffConfig {
  reps: string
  rest: string
}

export interface WarmupConfig {
  sets: number
  reps: string
  note: string
}

export interface FeederConfig {
  reps: string
  rest: string
}

export interface SessionSetData {
  workoutExerciseId: string
  setType: SetType
  setNumber: number
  weight?: number
  reps?: number
  rpe?: number
  completed: boolean
  notes?: string
}

export interface ExerciseWithConfig {
  id: string
  name: string
  equipmentOptions: string | null
  muscleGroups: string[]
  videoUrl: string | null
  workoutExerciseId: string
  orderIndex: number
  hasWarmup: boolean
  warmupConfig: WarmupConfig | null
  feeder1Config: FeederConfig | null
  feeder2Config: FeederConfig | null
  workingSetConfig: WorkingSetConfig
  backoffConfig: BackoffConfig | null
}

export interface ProgramWithDetails {
  id: string
  name: string
  description: string | null
  durationWeeks: number
  isTemplate: boolean
  phases: PhaseInfo[]
  workouts: WorkoutInfo[]
  tips: TipInfo[]
  rotations: RotationInfo[]
}

export interface PhaseInfo {
  id: string
  weekStart: number
  weekEnd: number
  name: string
  description: string
  color: string
  orderIndex: number
}

export interface WorkoutInfo {
  id: string
  name: string
  icon: string
  orderIndex: number
  exerciseCount: number
  muscleGroups: string[]
}

export interface TipInfo {
  id: string
  icon: string
  title: string
  text: string
  orderIndex: number
}

export interface RotationInfo {
  id: string
  label: string
  orderIndex: number
  slots: RotationSlotInfo[]
}

export interface RotationSlotInfo {
  dayOfWeek: number
  workoutId: string | null
  isRest: boolean
  displayLabel: string
}

export interface SessionSummary {
  id: string
  workoutName: string
  workoutIcon: string
  phaseWeek: number
  startedAt: string
  completedAt: string | null
  duration: number | null
  rating: number | null
  rpe: number | null
  totalVolume: number
  setsCompleted: number
  totalSets: number
}

export interface PersonalRecordInfo {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
  isNew?: boolean
}

export interface StatsOverview {
  totalSessions: number
  sessionsThisMonth: number
  currentStreak: number
  totalVolume: number
  averageRating: number
  averageDuration: number
}
