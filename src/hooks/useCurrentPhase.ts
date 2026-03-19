'use client'

import { useMemo } from 'react'
import { getCurrentWeek, getPhaseForWeek } from '@/utils/formatters'

interface PhaseInfo {
  currentWeek: number
  currentPhase: number
  phaseName: string
  phaseColor: string
  weeksInPhase: number
  weekInPhase: number
  totalWeeks: number
}

const PHASE_NAMES: Record<number, string> = {
  1: 'Adaptação',
  2: 'Força Base',
  3: 'Hipertrofia',
  4: 'Intensificação',
}

const PHASE_COLORS: Record<number, string> = {
  1: '#FF3B30',
  2: '#FF9500',
  3: '#AF52DE',
  4: '#30D158',
}

export function useCurrentPhase(startDate: string | Date | null): PhaseInfo | null {
  return useMemo(() => {
    if (!startDate) return null

    const start = new Date(startDate)
    const currentWeek = getCurrentWeek(start)
    const currentPhase = getPhaseForWeek(currentWeek)
    const phaseStartWeek = (currentPhase - 1) * 4 + 1
    const weekInPhase = currentWeek - phaseStartWeek + 1

    return {
      currentWeek,
      currentPhase,
      phaseName: PHASE_NAMES[currentPhase],
      phaseColor: PHASE_COLORS[currentPhase],
      weeksInPhase: 4,
      weekInPhase,
      totalWeeks: 16,
    }
  }, [startDate])
}
