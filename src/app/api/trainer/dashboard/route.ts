import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  try {
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!trainerProfile) {
      return errorResponse('Perfil de treinador não encontrado', 404)
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const students = await prisma.studentProfile.findMany({
      where: { trainerId: trainerProfile.id },
      include: {
        user: { select: { id: true, name: true } },
        workoutSessions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: { startedAt: true },
        },
      },
    })

    const totalStudents = students.length

    const studentIds = students.map((s) => s.id)

    const sessionsThisWeek = await prisma.workoutSession.count({
      where: {
        studentId: { in: studentIds },
        startedAt: { gte: sevenDaysAgo },
      },
    })

    const inactiveStudents = students
      .filter((s) => {
        const lastSession = s.workoutSessions[0]?.startedAt
        return !lastSession || lastSession < sevenDaysAgo
      })
      .map((s) => ({
        id: s.id,
        name: s.user.name,
        lastSession: s.workoutSessions[0]?.startedAt || null,
      }))

    const recentSessions = await prisma.workoutSession.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
        workout: { select: { name: true } },
      },
    })

    return jsonResponse({
      totalStudents,
      sessionsThisWeek,
      inactiveStudents,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        studentName: s.student.user.name,
        workoutName: s.workout.name,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        duration: s.duration,
        rating: s.rating,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar dashboard do treinador:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
