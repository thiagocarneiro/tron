'use client'

import { getDayName, getCurrentDayOfWeek, cn } from '@/utils/formatters'

interface ScheduleSlot {
  dayOfWeek: number
  workoutId: string | null
  workoutName: string | null
  workoutIcon: string | null
  workoutOrderIndex: number | null
  isRest: boolean
}

interface WeeklyCalendarStripProps {
  slots: ScheduleSlot[]
  onDayTap?: (dayOfWeek: number) => void
  showEditButton?: boolean
  onEditTap?: () => void
}

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function WeeklyCalendarStrip({ slots, onDayTap, showEditButton, onEditTap }: WeeklyCalendarStripProps) {
  const today = getCurrentDayOfWeek()
  const sorted = [...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-7 gap-1">
        {sorted.map(slot => {
          const isToday = slot.dayOfWeek === today
          const letter = slot.workoutOrderIndex !== null ? WORKOUT_LETTERS[slot.workoutOrderIndex] : null

          return (
            <button
              key={slot.dayOfWeek}
              type="button"
              onClick={() => onDayTap?.(slot.dayOfWeek)}
              className={cn(
                'flex flex-col items-center py-2 rounded-lg transition-all',
                isToday && !slot.isRest && 'bg-primary/15 ring-1 ring-primary/40',
                isToday && slot.isRest && 'bg-surface-container-high ring-1 ring-outline-variant/30',
                !isToday && 'bg-surface-container-low',
                onDayTap && 'cursor-pointer hover:bg-surface-container-high active:scale-95',
                !onDayTap && 'cursor-default',
              )}
            >
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wider',
                isToday ? 'text-primary' : 'text-on-surface-variant',
              )}>
                {getDayName(slot.dayOfWeek)}
              </span>
              <span className={cn(
                'text-sm font-[family-name:var(--font-headline)] font-bold mt-0.5',
                isToday && !slot.isRest && 'text-primary',
                isToday && slot.isRest && 'text-on-surface-variant',
                !isToday && !slot.isRest && 'text-on-surface',
                !isToday && slot.isRest && 'text-on-surface-variant/40',
              )}>
                {slot.isRest ? '—' : letter || '?'}
              </span>
            </button>
          )
        })}
      </div>
      {showEditButton && (
        <button
          type="button"
          onClick={onEditTap}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Editar calendario"
        >
          <span className="material-symbols-outlined text-lg">edit_calendar</span>
        </button>
      )}
    </div>
  )
}
