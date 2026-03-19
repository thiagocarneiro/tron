'use client'

import { Check } from 'lucide-react'
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
  WARMUP: '#FF9500',
  FEEDER_1: '#FF9500',
  FEEDER_2: '#FF9500',
  WORKING: '#FF3B30',
  BACKOFF: '#AF52DE',
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

  return (
    <div className={cn(
      'flex items-center gap-2 py-3 px-3 rounded-xl transition-all duration-200',
      completed
        ? 'bg-green-500/10 border border-green-500/20'
        : 'bg-[#1a1a1a] border border-[#2a2a2a]'
    )}>
      {/* Set type label */}
      <div className="w-20 flex-shrink-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color }}
        >
          {setTypeLabels[setType]} {setNumber}
        </span>
        <p className="text-[10px] text-[#555]">{targetReps} reps</p>
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
            'w-full px-2 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-center text-sm',
            'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 placeholder-[#333]',
            'transition-all duration-200',
            completed && 'opacity-60'
          )}
          disabled={disabled || completed}
        />
        <p className="text-[8px] text-[#444] text-center mt-0.5">KG</p>
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={e => onRepsChange(e.target.value)}
          placeholder={previousReps ? `${previousReps}` : '0'}
          aria-label={`Repetições ${setTypeLabels[setType]} ${setNumber}`}
          className={cn(
            'w-full px-2 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-center text-sm',
            'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 placeholder-[#333]',
            'transition-all duration-200',
            completed && 'opacity-60'
          )}
          disabled={disabled || completed}
        />
        <p className="text-[8px] text-[#444] text-center mt-0.5">REPS</p>
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={disabled || completed}
        aria-label={completed ? 'Set completado' : 'Completar set'}
        className={cn(
          'w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 touch-target',
          completed
            ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
            : 'bg-[#0a0a0a] border border-[#2a2a2a] text-[#555] hover:border-green-500 hover:text-green-500 active:scale-95'
        )}
      >
        <Check size={18} strokeWidth={completed ? 3 : 2} />
      </button>
    </div>
  )
}
