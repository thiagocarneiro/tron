import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

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

    const { page, limit, skip } = getPaginationParams(request)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where: { trainerId: trainerProfile.id },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true, avatarUrl: true },
          },
          workoutSessions: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            select: { startedAt: true },
          },
        },
      }),
      prisma.studentProfile.count({
        where: { trainerId: trainerProfile.id },
      }),
    ])

    const studentIds = students.map((s) => s.id)

    const sessionsThisMonth = await prisma.workoutSession.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        startedAt: { gte: startOfMonth },
      },
      _count: { id: true },
    })

    const sessionsMap = new Map(
      sessionsThisMonth.map((s) => [s.studentId, s._count.id])
    )

    const data = students.map((student) => {
      const lastSession = student.workoutSessions[0]?.startedAt || null
      const isActive = lastSession ? lastSession >= sevenDaysAgo : false

      return {
        id: student.id,
        user: {
          name: student.user.name,
          email: student.user.email,
          avatarUrl: student.user.avatarUrl,
        },
        studentProfile: {
          startDate: student.startDate,
          gender: student.gender,
          height: student.height,
        },
        lastSession,
        sessionsThisMonth: sessionsMap.get(student.id) || 0,
        status: isActive ? 'active' : 'inactive',
      }
    })

    return jsonResponse({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
