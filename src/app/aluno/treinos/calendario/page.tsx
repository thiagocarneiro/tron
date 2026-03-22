'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import api from '@/api/client'
import { useToast } from '@/components/ui/Toast'
import { DaySlotCard } from '@/components/student/DaySlotCard'
import { WorkoutPickerSheet } from '@/components/student/WorkoutPickerSheet'
import { Button } from '@/components/ui/Button'
import { getDayName, cn } from '@/utils/formatters'
import { validateAlternation, getValidCategoriesForDay, type ScheduleSlotInput } from '@/lib/schedule-validation'

interface WorkoutData {
  id: string
  name: string
  icon: string
  category: string | null
  orderIndex: number
}

interface RotationData {
  id: string
  label: string
  slots: { dayOfWeek: number; workoutId: string | null; isRest: boolean; displayLabel: string }[]
}

interface SlotState {
  dayOfWeek: number
  workoutId: string | null
  isRest: boolean
}

interface ScheduleSlotData {
  dayOfWeek: number
  workoutId: string | null
  workoutName: string | null
  workoutIcon: string | null
  workoutCategory: string | null
  workoutOrderIndex: number | null
  isRest: boolean
}

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function CalendarioPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [rotations, setRotations] = useState<RotationData[]>([])
  const [slots, setSlots] = useState<SlotState[]>(
    Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, workoutId: null, isRest: false }))
  )
  const [pickerDay, setPickerDay] = useState<number | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<number[]>([])
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false)

  // Load program data
  useEffect(() => {
    api.get('/student/program')
      .then(res => {
        const { program, schedule } = res.data
        setWorkouts(program.workouts.map((w: WorkoutData) => ({
          id: w.id,
          name: w.name,
          icon: w.icon,
          category: w.category,
          orderIndex: w.orderIndex,
        })))
        setRotations(program.rotations || [])

        if (schedule?.slots) {
          setHasExistingSchedule(true)
          setSlots(schedule.slots.map((s: ScheduleSlotData) => ({
            dayOfWeek: s.dayOfWeek,
            workoutId: s.workoutId,
            isRest: s.isRest,
          })))
        }
      })
      .catch(() => showToast('Erro ao carregar programa', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  // Category map for validation
  const categoryMap = new Map<string, string | null>()
  for (const w of workouts) {
    categoryMap.set(w.id, w.category)
  }

  // Validate whenever slots change
  useEffect(() => {
    const trainingSlots = slots.filter(s => s.workoutId && !s.isRest)
    if (trainingSlots.length < 2) {
      setValidationErrors([])
      return
    }
    const result = validateAlternation(slots, categoryMap)
    setValidationErrors(result.conflictDays || [])
  }, [slots, workouts])

  const getWorkoutById = (id: string) => workouts.find(w => w.id === id)

  const updateSlot = useCallback((dayOfWeek: number, workoutId: string | null, isRest: boolean) => {
    setSlots(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, workoutId, isRest } : s
    ))
  }, [])

  const applyPreset = (rotation: RotationData) => {
    setSlots(rotation.slots.map(s => ({
      dayOfWeek: s.dayOfWeek,
      workoutId: s.workoutId,
      isRest: s.isRest,
    })))
    showToast(`Preset "${rotation.label}" aplicado`, 'success')
  }

  const clearAll = () => {
    setSlots(Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, workoutId: null, isRest: false })))
  }

  const getDisabledWorkouts = (dayOfWeek: number): Set<string> => {
    const validCategories = getValidCategoriesForDay(slots, dayOfWeek, categoryMap)
    if (!validCategories) return new Set()

    const disabled = new Set<string>()
    for (const w of workouts) {
      if (w.category && !validCategories.has(w.category)) {
        disabled.add(w.id)
      }
    }
    return disabled
  }

  const handleSave = async () => {
    const hasTraining = slots.some(s => s.workoutId)
    if (!hasTraining) {
      showToast('Defina pelo menos um dia de treino', 'error')
      return
    }

    // Fill empty slots as rest
    const finalSlots = slots.map(s => ({
      dayOfWeek: s.dayOfWeek,
      workoutId: s.workoutId,
      isRest: !s.workoutId,
    }))

    const result = validateAlternation(finalSlots, categoryMap)
    if (!result.valid) {
      showToast(result.error!, 'error')
      return
    }

    setSaving(true)
    try {
      await api.put('/student/schedule', { slots: finalSlots })
      showToast('Calendario salvo!', 'success')
      router.push('/aluno/treinos')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      showToast(error.response?.data?.error || 'Erro ao salvar calendario', 'error')
    } finally {
      setSaving(false)
    }
  }

  // DnD handlers
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return

    const workoutId = active.id as string
    const dayOfWeek = parseInt(over.id as string)
    if (isNaN(dayOfWeek)) return

    // Check if this workout is valid for this day
    const disabled = getDisabledWorkouts(dayOfWeek)
    if (disabled.has(workoutId)) {
      showToast('Treino invalido para este dia - alterne Upper/Lower', 'error')
      return
    }

    updateSlot(dayOfWeek, workoutId, false)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        <div className="h-8 w-48 skeleton-shimmer rounded" />
        <div className="space-y-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-16 skeleton-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto min-h-screen page-transition pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-headline)] font-black uppercase tracking-tighter">
            {hasExistingSchedule ? 'Editar Calendario' : 'Meu Calendario'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Defina seus treinos para cada dia da semana
          </p>
        </div>
      </div>

      {/* Presets */}
      {rotations.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Inicio rapido
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {rotations.map(rotation => (
              <button
                key={rotation.id}
                type="button"
                onClick={() => applyPreset(rotation)}
                className="flex-shrink-0 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-full text-sm font-bold text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-95"
              >
                {rotation.label}
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="flex-shrink-0 px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-full text-sm font-bold text-on-surface-variant hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all active:scale-95"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Tap-to-assign list */}
      <div className="lg:hidden space-y-3">
        {slots
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map(slot => {
            const workout = slot.workoutId ? getWorkoutById(slot.workoutId) : null
            return (
              <DaySlotCard
                key={slot.dayOfWeek}
                dayOfWeek={slot.dayOfWeek}
                workoutName={workout?.name || null}
                workoutIcon={workout?.icon || null}
                workoutOrderIndex={workout?.orderIndex ?? null}
                isRest={slot.isRest}
                hasError={validationErrors.includes(slot.dayOfWeek)}
                errorMessage={validationErrors.includes(slot.dayOfWeek) ? 'Alterne entre Upper e Lower Body' : undefined}
                onTap={() => setPickerDay(slot.dayOfWeek)}
              />
            )
          })}
      </div>

      {/* Desktop: Drag-and-drop */}
      <div className="hidden lg:block">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-[280px_1fr] gap-8">
            {/* Draggable workout cards */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Arraste para os dias
              </p>
              {workouts.map(workout => (
                <DraggableWorkout key={workout.id} workout={workout} />
              ))}
              {/* Rest card - click to assign */}
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl mb-1">bedtime</span>
                <p className="text-xs text-on-surface-variant/60 font-bold uppercase tracking-wider">
                  Clique no dia para marcar descanso
                </p>
              </div>
            </div>

            {/* Droppable day slots */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Dias da semana
              </p>
              {slots
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map(slot => {
                  const workout = slot.workoutId ? getWorkoutById(slot.workoutId) : null
                  return (
                    <DroppableDaySlot
                      key={slot.dayOfWeek}
                      slot={slot}
                      workout={workout || null}
                      hasError={validationErrors.includes(slot.dayOfWeek)}
                      onClear={() => updateSlot(slot.dayOfWeek, null, false)}
                      onTap={() => setPickerDay(slot.dayOfWeek)}
                      isOverValid={activeDragId ? !getDisabledWorkouts(slot.dayOfWeek).has(activeDragId) : true}
                    />
                  )
                })}
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay dropAnimation={null}>
            {activeDragId && (() => {
              const workout = getWorkoutById(activeDragId)
              if (!workout) return null
              return (
                <div className="bg-primary/20 border-2 border-primary rounded-xl p-4 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-[family-name:var(--font-headline)] font-black text-primary">
                      {WORKOUT_LETTERS[workout.orderIndex]}
                    </span>
                    <span className="text-sm font-bold text-on-surface">{workout.name}</span>
                  </div>
                </div>
              )
            })()}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Picker bottom sheet (mobile) */}
      {pickerDay !== null && (
        <WorkoutPickerSheet
          isOpen={true}
          onClose={() => setPickerDay(null)}
          dayOfWeek={pickerDay}
          workouts={workouts.map(w => ({
            ...w,
            disabled: getDisabledWorkouts(pickerDay).has(w.id),
          }))}
          selectedWorkoutId={slots.find(s => s.dayOfWeek === pickerDay)?.workoutId || null}
          isRest={slots.find(s => s.dayOfWeek === pickerDay)?.isRest || false}
          onSelect={(workoutId, isRest) => updateSlot(pickerDay, workoutId, isRest)}
        />
      )}

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-outline-variant/10 lg:left-64 safe-bottom z-40">
        <div className="max-w-4xl mx-auto">
          <Button
            fullWidth
            loading={saving}
            onClick={handleSave}
            disabled={validationErrors.length > 0}
          >
            {hasExistingSchedule ? 'Atualizar Calendario' : 'Salvar Calendario'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ──── Draggable Workout Card (Desktop) ────

function DraggableWorkout({ workout }: { workout: WorkoutData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: workout.id,
  })

  const letter = WORKOUT_LETTERS[workout.orderIndex]
  const categoryLabel = workout.category === 'UPPER' ? 'Upper' : workout.category === 'LOWER' ? 'Lower' : ''

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 cursor-grab active:cursor-grabbing transition-all',
        'hover:border-primary/30 hover:bg-surface-container-high',
        isDragging && 'opacity-40 scale-95',
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-[family-name:var(--font-headline)] font-black text-sm">
          {letter}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{workout.name}</p>
          {categoryLabel && (
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{categoryLabel} Body</p>
          )}
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/30">drag_indicator</span>
      </div>
    </div>
  )
}

// ──── Droppable Day Slot (Desktop) ────

interface DroppableDaySlotProps {
  slot: SlotState
  workout: WorkoutData | null
  hasError: boolean
  onClear: () => void
  onTap: () => void
  isOverValid: boolean
}

function DroppableDaySlot({ slot, workout, hasError, onClear, onTap, isOverValid }: DroppableDaySlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id: String(slot.dayOfWeek) })
  const letter = workout ? WORKOUT_LETTERS[workout.orderIndex] : null
  const today = new Date()
  const jsDay = today.getDay()
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1
  const isToday = slot.dayOfWeek === todayIdx
  const hasWorkout = !!workout && !slot.isRest

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border transition-all min-h-[72px]',
        hasError && 'border-[#EF4444]/50 bg-[#EF4444]/5',
        !hasError && isOver && isOverValid && 'border-primary/50 bg-primary/10 scale-[1.02]',
        !hasError && isOver && !isOverValid && 'border-[#EF4444]/50 bg-[#EF4444]/5',
        !hasError && !isOver && hasWorkout && 'border-primary/15 bg-primary/[0.04]',
        !hasError && !isOver && isToday && !hasWorkout && 'border-primary/20 bg-primary/5',
        !hasError && !isOver && !isToday && !hasWorkout && 'border-outline-variant/10 bg-surface-container-low',
      )}
    >
      {/* Day label */}
      <div className={cn(
        'w-14 h-14 rounded-lg flex flex-col items-center justify-center flex-shrink-0',
        isToday ? 'bg-primary text-black' : 'bg-surface-container-highest text-on-surface-variant',
      )}>
        <span className="text-xs font-bold uppercase">{getDayName(slot.dayOfWeek)}</span>
        {isToday && <span className="text-[8px] font-bold uppercase mt-0.5">Hoje</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!workout && !slot.isRest ? (
          <button onClick={onTap} className="text-sm text-on-surface-variant/40 italic hover:text-on-surface-variant transition-colors">
            Arraste um treino ou clique aqui
          </button>
        ) : slot.isRest ? (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-base">bedtime</span>
            <span className="text-sm text-on-surface-variant/60 font-medium">Descanso</span>
          </div>
        ) : workout ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-primary tracking-widest">{letter}</span>
            <span className="text-sm font-bold truncate">{workout.name}</span>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      {(workout || slot.isRest) && (
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-white/5 rounded-md transition-colors flex-shrink-0"
          aria-label="Limpar dia"
        >
          <span className="material-symbols-outlined text-on-surface-variant/40 text-base">close</span>
        </button>
      )}
      {!workout && !slot.isRest && (
        <button
          onClick={onTap}
          className="p-1.5 hover:bg-white/5 rounded-md transition-colors flex-shrink-0"
          aria-label="Selecionar treino"
        >
          <span className="material-symbols-outlined text-primary text-base">add_circle</span>
        </button>
      )}
    </div>
  )
}
