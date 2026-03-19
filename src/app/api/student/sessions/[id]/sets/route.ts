import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id: sessionId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    return errorResponse('Sessão não encontrada', 404)
  }

  if (session.studentId !== profile.id) {
    return errorResponse('Acesso negado', 403)
  }

  try {
    const body = await request.json()
    const { workoutExerciseId, setType, setNumber, weight, reps, rpe, completed, notes } = body

    if (!workoutExerciseId) {
      return errorResponse('workoutExerciseId é obrigatório', 400)
    }

    if (!setType) {
      return errorResponse('setType é obrigatório', 400)
    }

    if (setNumber === undefined || setNumber === null) {
      return errorResponse('setNumber é obrigatório', 400)
    }

    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    })

    if (!workoutExercise) {
      return errorResponse('Exercício do treino não encontrado', 404)
    }

    if (workoutExercise.workoutId !== session.workoutId) {
      return errorResponse('Este exercício não pertence a este treino', 400)
    }

    const set = await prisma.sessionSet.create({
      data: {
        sessionId,
        workoutExerciseId,
        setType,
        setNumber,
        weight: weight ?? null,
        reps: reps ?? null,
        rpe: rpe ?? null,
        completed: completed ?? false,
        notes: notes ?? null,
      },
      include: {
        workoutExercise: {
          include: {
            exercise: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return jsonResponse(set, 201)
  } catch (error) {
    return errorResponse('Erro ao criar set', 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id: sessionId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    return errorResponse('Sessão não encontrada', 404)
  }

  if (session.studentId !== profile.id) {
    return errorResponse('Acesso negado', 403)
  }

  const sets = await prisma.sessionSet.findMany({
    where: { sessionId },
    orderBy: [{ workoutExerciseId: 'asc' }, { setNumber: 'asc' }],
    include: {
      workoutExercise: {
        include: {
          exercise: {
            select: { id: true, name: true, muscleGroups: true },
          },
        },
      },
    },
  })

  return jsonResponse(sets)
}
