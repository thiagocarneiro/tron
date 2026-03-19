export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`
  }
  if (minutes > 0) {
    return `${minutes}min ${secs.toString().padStart(2, '0')}s`
  }
  return `${secs}s`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export function formatWeight(weight: number): string {
  return weight % 1 === 0 ? `${weight}kg` : `${weight.toFixed(1)}kg`
}

export function calculateVolume(sets: { weight?: number | null; reps?: number | null; completed: boolean }[]): number {
  return sets
    .filter(s => s.completed && s.weight && s.reps)
    .reduce((total, s) => total + (s.weight! * s.reps!), 0)
}

export function getCurrentWeek(startDate: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.min(16, Math.max(1, Math.floor(diffDays / 7) + 1))
}

export function getPhaseForWeek(week: number): number {
  if (week <= 4) return 1
  if (week <= 8) return 2
  if (week <= 12) return 3
  return 4
}

export function getDayName(dayIndex: number): string {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  return days[dayIndex] || ''
}

export function parseRestTime(rest: string): number {
  // Parse rest time strings like "1min", "2min", "1–2min", "20s", "2–3min"
  const match = rest.match(/(\d+)(?:–(\d+))?\s*(min|s)/)
  if (!match) return 60

  const value = parseInt(match[2] || match[1]) // Use upper bound if range
  const unit = match[3]

  return unit === 'min' ? value * 60 : value
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
