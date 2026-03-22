'use client'

import { getFullDayName, getCurrentDayOfWeek, cn } from '@/utils/formatters'

interface DaySlotCardProps {
  dayOfWeek: number
  workoutName: string | null
  workoutIcon: string | null
  workoutOrderIndex: number | null
  isRest: boolean
  hasError: boolean
  errorMessage?: string
  onTap: () => void
}

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function DaySlotCard({
  dayOfWeek,
  workoutName,
  workoutOrderIndex,
  isRest,
  hasError,
  errorMessage,
  onTap,
}: DaySlotCardProps) {
  const isToday = dayOfWeek === getCurrentDayOfWeek()
  const letter = workoutOrderIndex !== null ? WORKOUT_LETTERS[workoutOrderIndex] : null
  const isEmpty = !workoutName && !isRest

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onTap}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]',
          'border',
          hasError && 'border-[#EF4444]/50 bg-[#EF4444]/5',
          !hasError && isToday && 'border-primary/30 bg-primary/5',
          !hasError && !isToday && 'border-outline-variant/10 bg-surface-container-low hover:bg-surface-container-high',
        )}
      >
        {/* Day indicator */}
        <div className={cn(
          'w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0',
          isToday ? 'bg-primary text-black' : 'bg-surface-container-highest text-on-surface-variant',
        )}>
          <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
            {getFullDayName(dayOfWeek).slice(0, 3)}
          </span>
          {isToday && (
            <span className="text-[7px] font-bold uppercase tracking-wider mt-0.5 leading-none">Hoje</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          {isEmpty ? (
            <p className="text-sm text-on-surface-variant/50 italic">Toque para definir</p>
          ) : isRest ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-base">bedtime</span>
              <p className="text-sm text-on-surface-variant/60 font-medium">Descanso</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                {letter && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {letter}
                  </span>
                )}
                <p className="text-sm font-bold text-on-surface truncate">{workoutName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action icon */}
        <span className={cn(
          'material-symbols-outlined text-lg flex-shrink-0',
          isEmpty ? 'text-primary' : 'text-on-surface-variant/40',
        )}>
          {isEmpty ? 'add_circle' : 'swap_horiz'}
        </span>
      </button>

      {hasError && errorMessage && (
        <p className="text-[11px] text-[#EF4444] px-4 font-medium">{errorMessage}</p>
      )}
    </div>
  )
}
