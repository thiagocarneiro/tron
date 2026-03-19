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

  const assignment = await prisma.programAssignment.findFirst({
    where: { studentId: profile.id, isActive: true },
    include: {
      program: {
        include: {
          phases: {
            orderBy: { orderIndex: 'asc' },
          },
          workouts: {
            orderBy: { orderIndex: 'asc' },
            include: {
              exercises: {
                include: {
                  exercise: {
                    select: { muscleGroups: true },
                  },
                },
              },
            },
          },
          tips: {
            orderBy: { orderIndex: 'asc' },
          },
          rotations: {
            orderBy: { orderIndex: 'asc' },
            include: {
              slots: {
                orderBy: { dayOfWeek: 'asc' },
              },
            },
          },
        },
      },
    },
  })

  if (!assignment) {
    return errorResponse('Nenhum programa ativo encontrado', 404)
  }

  const workouts = assignment.program.workouts.map((workout) => {
    const allMuscleGroups = workout.exercises.flatMap(
      (we) => we.exercise.muscleGroups
    )
    const uniqueMuscleGroups = [...new Set(allMuscleGroups)]

    return {
      id: workout.id,
      programId: workout.programId,
      name: workout.name,
      icon: workout.icon,
      orderIndex: workout.orderIndex,
      exerciseCount: workout.exercises.length,
      muscleGroups: uniqueMuscleGroups,
    }
  })

  return jsonResponse({
    assignment: {
      id: assignment.id,
      startDate: assignment.startDate,
      isActive: assignment.isActive,
      customNotes: assignment.customNotes,
    },
    program: {
      id: assignment.program.id,
      name: assignment.program.name,
      description: assignment.program.description,
      durationWeeks: assignment.program.durationWeeks,
      phases: assignment.program.phases,
      workouts,
      tips: assignment.program.tips,
      rotations: assignment.program.rotations,
    },
  })
}
