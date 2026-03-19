import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  try {
    const body = await request.json()
    const { workoutId, phaseWeek } = body

    if (!workoutId) {
      return errorResponse('workoutId é obrigatório', 400)
    }

    if (phaseWeek === undefined || phaseWeek === null) {
      return errorResponse('phaseWeek é obrigatório', 400)
    }

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    })

    if (!workout) {
      return errorResponse('Treino não encontrado', 404)
    }

    const assignment = await prisma.programAssignment.findFirst({
      where: {
        studentId: profile.id,
        programId: workout.programId,
        isActive: true,
      },
    })

    if (!assignment) {
      return errorResponse('Você não tem acesso a este treino', 403)
    }

    const session = await prisma.workoutSession.create({
      data: {
        studentId: profile.id,
        workoutId,
        phaseWeek,
      },
      include: {
        workout: {
          select: { name: true, icon: true },
        },
      },
    })

    return jsonResponse(session, 201)
  } catch (error) {
    return errorResponse('Erro ao criar sessão de treino', 500)
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const { page, limit, skip } = getPaginationParams(request)
  const url = new URL(request.url)
  const workoutId = url.searchParams.get('workoutId')
  const dateFrom = url.searchParams.get('dateFrom')
  const dateTo = url.searchParams.get('dateTo')

  const where: Record<string, unknown> = { studentId: profile.id }

  if (workoutId) {
    where.workoutId = workoutId
  }

  if (dateFrom || dateTo) {
    const startedAt: Record<string, Date> = {}
    if (dateFrom) startedAt.gte = new Date(dateFrom)
    if (dateTo) startedAt.lte = new Date(dateTo)
    where.startedAt = startedAt
  }

  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip,
      take: limit,
      include: {
        workout: {
          select: { name: true, icon: true },
        },
      },
    }),
    prisma.workoutSession.count({ where }),
  ])

  return jsonResponse({
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
