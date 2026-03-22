import { z } from 'zod'

export interface ScheduleSlotInput {
  dayOfWeek: number
  workoutId: string | null
  isRest: boolean
}

export const scheduleSchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    workoutId: z.string().uuid().nullable(),
    isRest: z.boolean(),
  })).length(7).refine(
    slots => new Set(slots.map(s => s.dayOfWeek)).size === 7,
    'Cada dia da semana deve aparecer exatamente uma vez'
  ).refine(
    slots => slots.every(s => s.isRest ? s.workoutId === null : s.workoutId !== null),
    'Dias de treino precisam de um treino atribuido; dias de descanso nao podem ter treino'
  ),
})

/**
 * Validates that CONSECUTIVE calendar days with workouts alternate
 * between different workout categories (e.g., UPPER/LOWER).
 * A rest/free day between two same-category days is allowed.
 * The check is cyclic (Sun wraps to Mon).
 */
export function validateAlternation(
  slots: ScheduleSlotInput[],
  workoutCategories: Map<string, string | null>
): { valid: boolean; error?: string; conflictDays?: number[] } {
  const sorted = [...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  const dayNames = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo']

  // Only check pairs of consecutive calendar days (including Sun->Mon wrap)
  for (let i = 0; i < 7; i++) {
    const current = sorted[i]
    const next = sorted[(i + 1) % 7]

    // Only validate if BOTH consecutive days have workouts
    if (!current.workoutId || current.isRest) continue
    if (!next.workoutId || next.isRest) continue

    const currentCategory = workoutCategories.get(current.workoutId)
    const nextCategory = workoutCategories.get(next.workoutId)

    if (!currentCategory || !nextCategory) continue

    if (currentCategory === nextCategory) {
      return {
        valid: false,
        error: `${dayNames[current.dayOfWeek]} e ${dayNames[next.dayOfWeek]} sao ambos ${currentCategory === 'UPPER' ? 'Upper Body' : 'Lower Body'}. Alterne entre Upper e Lower ou coloque um dia livre entre eles.`,
        conflictDays: [current.dayOfWeek, next.dayOfWeek],
      }
    }
  }

  return { valid: true }
}

/**
 * Given the current schedule state and a target day, returns which workout categories
 * are valid for that day (based on immediately adjacent calendar days only).
 * A rest/free day breaks the adjacency - no restriction in that direction.
 */
export function getValidCategoriesForDay(
  slots: ScheduleSlotInput[],
  targetDay: number,
  workoutCategories: Map<string, string | null>
): Set<string> | null {
  const slotByDay = new Map<number, ScheduleSlotInput>()
  for (const s of slots) {
    slotByDay.set(s.dayOfWeek, s)
  }

  const blockedCategories = new Set<string>()

  // Check immediately previous day (wrap around)
  const prevDay = (targetDay - 1 + 7) % 7
  const prevSlot = slotByDay.get(prevDay)
  if (prevSlot?.workoutId && !prevSlot.isRest) {
    const cat = workoutCategories.get(prevSlot.workoutId)
    if (cat) blockedCategories.add(cat)
  }

  // Check immediately next day (wrap around)
  const nextDay = (targetDay + 1) % 7
  const nextSlot = slotByDay.get(nextDay)
  if (nextSlot?.workoutId && !nextSlot.isRest) {
    const cat = workoutCategories.get(nextSlot.workoutId)
    if (cat) blockedCategories.add(cat)
  }

  if (blockedCategories.size === 0) return null // all categories valid

  const allCategories = new Set<string>()
  for (const cat of workoutCategories.values()) {
    if (cat) allCategories.add(cat)
  }

  const validCategories = new Set<string>()
  for (const cat of allCategories) {
    if (!blockedCategories.has(cat)) validCategories.add(cat)
  }

  return validCategories.size > 0 ? validCategories : null
}
