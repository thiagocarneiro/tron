'use client'

import { Modal } from '@/components/ui/Modal'
import { getFullDayName, cn } from '@/utils/formatters'

interface WorkoutOption {
  id: string
  name: string
  icon: string
  category: string | null
  orderIndex: number
  disabled: boolean
}

interface WorkoutPickerSheetProps {
  isOpen: boolean
  onClose: () => void
  dayOfWeek: number
  workouts: WorkoutOption[]
  selectedWorkoutId: string | null
  isRest: boolean
  onSelect: (workoutId: string | null, isRest: boolean) => void
}

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function WorkoutPickerSheet({
  isOpen,
  onClose,
  dayOfWeek,
  workouts,
  selectedWorkoutId,
  isRest,
  onSelect,
}: WorkoutPickerSheetProps) {
  const handleSelect = (workoutId: string | null, rest: boolean) => {
    onSelect(workoutId, rest)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getFullDayName(dayOfWeek)} size="sm">
      <div className="space-y-2">
        <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-4">
          Escolha o treino
        </p>

        {workouts.map(workout => {
          const letter = WORKOUT_LETTERS[workout.orderIndex]
          const isSelected = selectedWorkoutId === workout.id && !isRest
          const categoryLabel = workout.category === 'UPPER' ? 'Upper' : workout.category === 'LOWER' ? 'Lower' : ''

          return (
            <button
              key={workout.id}
              type="button"
              disabled={workout.disabled}
              onClick={() => handleSelect(workout.id, false)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg transition-all',
                isSelected && 'bg-primary/15 border border-primary/30',
                !isSelected && !workout.disabled && 'bg-surface-container-highest hover:bg-white/5 border border-transparent',
                workout.disabled && 'bg-surface-container-highest/50 opacity-40 cursor-not-allowed border border-transparent',
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-md flex items-center justify-center text-sm font-[family-name:var(--font-headline)] font-black',
                isSelected ? 'bg-primary text-black' : 'bg-surface-container-low text-on-surface-variant',
              )}>
                {letter}
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  'text-sm font-bold',
                  isSelected ? 'text-primary' : workout.disabled ? 'text-on-surface-variant' : 'text-on-surface',
                )}>
                  {workout.name}
                </p>
                {categoryLabel && (
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                    {categoryLabel} Body
                  </p>
                )}
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
              {workout.disabled && (
                <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider">
                  Adjacente
                </span>
              )}
            </button>
          )
        })}

        {/* Rest option */}
        <button
          type="button"
          onClick={() => handleSelect(null, true)}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-lg transition-all',
            isRest && 'bg-primary/15 border border-primary/30',
            !isRest && 'bg-surface-container-highest hover:bg-white/5 border border-transparent',
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-md flex items-center justify-center',
            isRest ? 'bg-primary text-black' : 'bg-surface-container-low text-on-surface-variant',
          )}>
            <span className="material-symbols-outlined text-lg">bedtime</span>
          </div>
          <div className="flex-1 text-left">
            <p className={cn(
              'text-sm font-bold',
              isRest ? 'text-primary' : 'text-on-surface',
            )}>
              Descanso
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
              Dia de recuperacao
            </p>
          </div>
          {isRest && (
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          )}
        </button>
      </div>
    </Modal>
  )
}
