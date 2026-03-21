'use client'

import { cn } from '@/utils/formatters'

interface SetRowProps {
  setType: string
  setNumber: number
  targetReps: string
  previousWeight: number | null
  previousReps: number | null
  weight: number | string
  reps: number | string
  completed: boolean
  onWeightChange: (value: number | string) => void
  onRepsChange: (value: number | string) => void
  onComplete: () => void
  disabled?: boolean
}

const setTypeLabels: Record<string, string> = {
  WARMUP: 'Aquecimento',
  FEEDER_1: 'Feeder 1',
  FEEDER_2: 'Feeder 2',
  WORKING: 'Working Set',
  BACKOFF: 'Back-off',
}

const setTypeColors: Record<string, string> = {
  WARMUP: '#adaaaa',
  FEEDER_1: '#fe7e90',
  FEEDER_2: '#fe7e90',
  WORKING: '#ff8e80',
  BACKOFF: '#d7a0ff',
}

export function SetRow({
  setType,
  setNumber,
  targetReps,
  previousWeight,
  previousReps,
  weight,
  reps,
  completed,
  onWeightChange,
  onRepsChange,
  onComplete,
  disabled,
}: SetRowProps) {
  const color = setTypeColors[setType]
  const isWorking = setType === 'WORKING'

  return (
    <div className={cn(
      'relative flex items-center gap-3 py-4 px-4 rounded-lg transition-all duration-200 overflow-hidden',
      completed
        ? 'bg-green-500/10'
        : isWorking
          ? 'bg-primary/5'
          : 'bg-surface-container-high/50'
    )}>
      {/* Set type color bar */}
      <div
        className={cn('absolute left-0 top-2 bottom-2 rounded-full', isWorking ? 'w-[3px]' : 'w-[2px]')}
        style={{ backgroundColor: color }}
      />

      {/* Set type label */}
      <div className="w-20 flex-shrink-0 pl-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {setTypeLabels[setType]} {setNumber}
        </span>
        <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest">{targetReps} reps</p>
      </div>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={weight}
          onChange={e => onWeightChange(e.target.value)}
          placeholder={previousWeight ? `${previousWeight}` : 'kg'}
          aria-label={`Peso ${setTypeLabels[setType]} ${setNumber}`}
          className={cn(
            'w-full px-2 py-3 bg-surface-container-low rounded-md text-center text-2xl font-bold font-[family-name:var(--font-headline)] tabular-nums text-on-surface',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder-on-surface-variant/30 placeholder:text-base placeholder:font-normal',
            'transition-all duration-200',
            completed && 'opacity-60'
          )}
          disabled={disabled || completed}
        />
        <p className="text-[9px] font-bold text-on-surface-variant text-center mt-0.5 uppercase tracking-widest">KG</p>
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={e => onRepsChange(e.target.value)}
          placeholder={previousReps ? `${previousReps}` : '0'}
          aria-label={`Repeticoes ${setTypeLabels[setType]} ${setNumber}`}
          className={cn(
            'w-full px-2 py-3 bg-surface-container-low rounded-md text-center text-2xl font-bold font-[family-name:var(--font-headline)] tabular-nums text-on-surface',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder-on-surface-variant/30 placeholder:text-base placeholder:font-normal',
            'transition-all duration-200',
            completed && 'opacity-60'
          )}
          disabled={disabled || completed}
        />
        <p className="text-[9px] font-bold text-on-surface-variant text-center mt-0.5 uppercase tracking-widest">REPS</p>
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={disabled || completed}
        aria-label={completed ? 'Set completado' : 'Completar set'}
        className={cn(
          'w-11 h-11 flex-shrink-0 rounded-md flex items-center justify-center transition-all duration-200 touch-target',
          completed
            ? 'text-primary animate-complete-pop'
            : 'text-surface-variant hover:text-primary active:scale-95'
        )}
      >
        <span
          className="material-symbols-outlined"
          style={completed ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {completed ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </button>
    </div>
  )
}
