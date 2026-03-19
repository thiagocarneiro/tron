import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

function getCurrentWeek(startDate: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - new Date(startDate).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.floor(diffDays / 7) + 1)
}

function safeParseJSON(value: string | null): unknown {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { workoutId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const assignment = await prisma.programAssignment.findFirst({
    where: { studentId: profile.id, isActive: true },
    include: {
      program: {
        include: {
          phases: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  })

  if (!assignment) {
    return errorResponse('Nenhum programa ativo encontrado', 404)
  }

  const currentWeek = getCurrentWeek(assignment.startDate)

  const currentPhase = assignment.program.phases.find(
    (phase) => currentWeek >= phase.weekStart && currentWeek <= phase.weekEnd
  ) || assignment.program.phases[assignment.program.phases.length - 1]

  if (!currentPhase) {
    return errorResponse('Nenhuma fase encontrada', 404)
  }

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      programId: assignment.programId,
    },
    include: {
      exercises: {
        orderBy: { orderIndex: 'asc' },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              equipmentOptions: true,
              muscleGroups: true,
              videoUrl: true,
              instructions: true,
              imageUrl: true,
            },
          },
          phaseConfigs: {
            where: { phaseId: currentPhase.id },
          },
        },
      },
    },
  })

  if (!workout) {
    return errorResponse('Treino não encontrado', 404)
  }

  const exercises = workout.exercises.map((we) => {
    const phaseConfig = we.phaseConfigs[0] || null

    return {
      id: we.id,
      orderIndex: we.orderIndex,
      exercise: we.exercise,
      hasWarmup: we.hasWarmup,
      warmupConfig: safeParseJSON(we.warmupConfig),
      feeder1Config: safeParseJSON(we.feeder1Config),
      feeder2Config: safeParseJSON(we.feeder2Config),
      phaseConfig: phaseConfig
        ? {
            id: phaseConfig.id,
            phaseId: phaseConfig.phaseId,
            workingSetConfig: safeParseJSON(phaseConfig.workingSetConfig),
            backoffConfig: safeParseJSON(phaseConfig.backoffConfig),
          }
        : null,
    }
  })

  return jsonResponse({
    id: workout.id,
    name: workout.name,
    icon: workout.icon,
    orderIndex: workout.orderIndex,
    currentPhase: {
      id: currentPhase.id,
      name: currentPhase.name,
      color: currentPhase.color,
      weekStart: currentPhase.weekStart,
      weekEnd: currentPhase.weekEnd,
    },
    currentWeek,
    exercises,
  })
}
