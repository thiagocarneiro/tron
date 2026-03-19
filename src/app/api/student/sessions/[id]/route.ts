import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const session = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      workout: {
        select: { id: true, name: true, icon: true },
      },
      sets: {
        orderBy: [{ workoutExerciseId: 'asc' }, { setNumber: 'asc' }],
        include: {
          workoutExercise: {
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  muscleGroups: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!session) {
    return errorResponse('Sessão não encontrada', 404)
  }

  if (session.studentId !== profile.id) {
    return errorResponse('Acesso negado', 403)
  }

  return jsonResponse(session)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const session = await prisma.workoutSession.findUnique({
    where: { id },
  })

  if (!session) {
    return errorResponse('Sessão não encontrada', 404)
  }

  if (session.studentId !== profile.id) {
    return errorResponse('Acesso negado', 403)
  }

  try {
    const body = await request.json()
    const { completedAt, duration, rating, rpe, notes } = body

    const updatedSession = await prisma.workoutSession.update({
      where: { id },
      data: {
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(duration !== undefined && { duration }),
        ...(rating !== undefined && { rating }),
        ...(rpe !== undefined && { rpe }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        workout: {
          select: { id: true, name: true, icon: true },
        },
        sets: {
          include: {
            workoutExercise: {
              include: {
                exercise: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    })

    const newPRs: Array<{
      exerciseId: string
      exerciseName: string
      weight: number
      reps: number
    }> = []

    if (completedAt) {
      const completedSets = updatedSession.sets.filter(
        (set) => set.completed && set.weight && set.weight > 0 && set.reps && set.reps > 0
      )

      const exerciseBestWeights = new Map<string, { weight: number; reps: number; name: string }>()

      for (const set of completedSets) {
        const exerciseId = set.workoutExercise.exerciseId
        const existing = exerciseBestWeights.get(exerciseId)

        if (!existing || set.weight! > existing.weight) {
          exerciseBestWeights.set(exerciseId, {
            weight: set.weight!,
            reps: set.reps!,
            name: set.workoutExercise.exercise.name,
          })
        }
      }

      for (const [exerciseId, best] of exerciseBestWeights) {
        const existingPR = await prisma.personalRecord.findUnique({
          where: {
            studentId_exerciseId: {
              studentId: profile.id,
              exerciseId,
            },
          },
        })

        if (!existingPR || best.weight > existingPR.weight || (best.weight === existingPR.weight && best.reps > existingPR.reps)) {
          await prisma.personalRecord.upsert({
            where: {
              studentId_exerciseId: {
                studentId: profile.id,
                exerciseId,
              },
            },
            update: {
              weight: best.weight,
              reps: best.reps,
              date: new Date(),
            },
            create: {
              studentId: profile.id,
              exerciseId,
              weight: best.weight,
              reps: best.reps,
            },
          })

          newPRs.push({
            exerciseId,
            exerciseName: best.name,
            weight: best.weight,
            reps: best.reps,
          })
        }
      }
    }

    return jsonResponse({
      ...updatedSession,
      newPRs,
    })
  } catch (error) {
    return errorResponse('Erro ao atualizar sessão', 500)
  }
}
