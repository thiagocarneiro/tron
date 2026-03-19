import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const allSessions = await prisma.workoutSession.findMany({
    where: {
      studentId: profile.id,
      completedAt: { not: null },
    },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      startedAt: true,
      completedAt: true,
      duration: true,
      rating: true,
    },
  })

  const totalSessions = allSessions.length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sessionsThisMonth = allSessions.filter(
    (s) => s.startedAt >= startOfMonth
  ).length

  // Current streak: consecutive days with sessions
  let currentStreak = 0
  if (allSessions.length > 0) {
    const sessionDates = new Set(
      allSessions.map((s) => {
        const d = new Date(s.startedAt)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    // Start counting from today or yesterday
    let checkDate = new Date(today)
    if (!sessionDates.has(todayStr)) {
      if (sessionDates.has(yesterdayStr)) {
        checkDate = new Date(yesterday)
      } else {
        currentStreak = 0
        checkDate = null as unknown as Date
      }
    }

    if (checkDate) {
      while (true) {
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
        if (sessionDates.has(dateStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }
  }

  // Total volume
  const allSets = await prisma.sessionSet.findMany({
    where: {
      session: {
        studentId: profile.id,
        completedAt: { not: null },
      },
      completed: true,
    },
    select: {
      weight: true,
      reps: true,
    },
  })

  const totalVolume = allSets.reduce((sum, set) => {
    if (set.weight && set.reps) {
      return sum + set.weight * set.reps
    }
    return sum
  }, 0)

  // Average rating
  const sessionsWithRating = allSessions.filter((s) => s.rating !== null)
  const averageRating =
    sessionsWithRating.length > 0
      ? sessionsWithRating.reduce((sum, s) => sum + s.rating!, 0) / sessionsWithRating.length
      : null

  // Average duration
  const sessionsWithDuration = allSessions.filter((s) => s.duration !== null)
  const averageDuration =
    sessionsWithDuration.length > 0
      ? Math.round(
          sessionsWithDuration.reduce((sum, s) => sum + s.duration!, 0) / sessionsWithDuration.length
        )
      : null

  return jsonResponse({
    totalSessions,
    sessionsThisMonth,
    currentStreak,
    totalVolume: Math.round(totalVolume),
    averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    averageDuration,
  })
}
