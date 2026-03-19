import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole } from '@/lib/api-utils'

async function getTrainerAndVerifyProgram(userId: string, programId: string) {
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId },
  })

  if (!trainerProfile) {
    return { error: errorResponse('Perfil de treinador não encontrado', 404) }
  }

  const program = await prisma.trainingProgram.findUnique({
    where: { id: programId },
  })

  if (!program) {
    return { error: errorResponse('Programa não encontrado', 404) }
  }

  if (program.createdById !== trainerProfile.id) {
    return { error: errorResponse('Este programa não pertence a você', 403) }
  }

  return { trainerProfile, program }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const result = await getTrainerAndVerifyProgram(auth.user.userId, id)
    if ('error' in result) return result.error

    const program = await prisma.trainingProgram.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: {
            phaseExerciseConfigs: {
              include: {
                workoutExercise: {
                  include: {
                    exercise: {
                      select: { id: true, name: true, muscleGroups: true },
                    },
                  },
                },
              },
            },
          },
        },
        workouts: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' },
              include: {
                exercise: true,
              },
            },
          },
        },
        rotations: {
          orderBy: { orderIndex: 'asc' },
          include: {
            slots: {
              orderBy: { dayOfWeek: 'asc' },
              include: {
                workout: { select: { id: true, name: true } },
              },
            },
          },
        },
        tips: {
          orderBy: { orderIndex: 'asc' },
        },
        assignments: {
          where: { isActive: true },
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    })

    if (!program) {
      return errorResponse('Programa não encontrado', 404)
    }

    // Parse JSON configs
    const phases = program.phases.map((phase) => ({
      ...phase,
      phaseExerciseConfigs: phase.phaseExerciseConfigs.map((config) => ({
        ...config,
        workingSetConfig: safeJsonParse(config.workingSetConfig),
        backoffConfig: config.backoffConfig
          ? safeJsonParse(config.backoffConfig)
          : null,
      })),
    }))

    const workouts = program.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((we) => ({
        ...we,
        warmupConfig: we.warmupConfig ? safeJsonParse(we.warmupConfig) : null,
        feeder1Config: we.feeder1Config
          ? safeJsonParse(we.feeder1Config)
          : null,
        feeder2Config: we.feeder2Config
          ? safeJsonParse(we.feeder2Config)
          : null,
      })),
    }))

    return jsonResponse({
      id: program.id,
      name: program.name,
      description: program.description,
      durationWeeks: program.durationWeeks,
      isTemplate: program.isTemplate,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      phases,
      workouts,
      rotations: program.rotations,
      tips: program.tips,
      assignedStudents: program.assignments.map((a) => ({
        assignmentId: a.id,
        studentId: a.studentId,
        studentName: a.student.user.name,
        startDate: a.startDate,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar detalhes do programa:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const result = await getTrainerAndVerifyProgram(auth.user.userId, id)
    if ('error' in result) return result.error

    const body = await request.json()
    const { name, description, durationWeeks } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (durationWeeks !== undefined) {
      if (typeof durationWeeks !== 'number' || durationWeeks < 1) {
        return errorResponse(
          'durationWeeks deve ser um número maior que 0',
          400
        )
      }
      updateData.durationWeeks = durationWeeks
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('Nenhum campo para atualizar', 400)
    }

    const updated = await prisma.trainingProgram.update({
      where: { id },
      data: updateData,
    })

    return jsonResponse(updated)
  } catch (error) {
    console.error('Erro ao atualizar programa:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const result = await getTrainerAndVerifyProgram(auth.user.userId, id)
    if ('error' in result) return result.error

    const activeAssignments = await prisma.programAssignment.count({
      where: { programId: id, isActive: true },
    })

    if (activeAssignments > 0) {
      // Deactivate all assignments first, then delete the program
      await prisma.programAssignment.updateMany({
        where: { programId: id, isActive: true },
        data: { isActive: false },
      })
    }

    // Delete the program (cascades to phases, workouts, tips, rotations)
    await prisma.trainingProgram.delete({
      where: { id },
    })

    return jsonResponse({ message: 'Programa excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir programa:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const result = await getTrainerAndVerifyProgram(auth.user.userId, id)
    if ('error' in result) return result.error

    // Fetch original program with all nested data
    const original = await prisma.trainingProgram.findUnique({
      where: { id },
      include: {
        phases: {
          include: { phaseExerciseConfigs: true },
        },
        workouts: {
          include: {
            exercises: {
              include: { phaseConfigs: true },
            },
          },
        },
        rotations: {
          include: { slots: true },
        },
        tips: true,
      },
    })

    if (!original) {
      return errorResponse('Programa não encontrado', 404)
    }

    // Create the duplicated program within a transaction
    const duplicated = await prisma.$transaction(async (tx) => {
      // 1. Create new program
      const newProgram = await tx.trainingProgram.create({
        data: {
          name: `${original.name} (Cópia)`,
          description: original.description,
          durationWeeks: original.durationWeeks,
          isTemplate: original.isTemplate,
          createdById: result.trainerProfile.id,
        },
      })

      // 2. Create phases and map old IDs to new IDs
      const phaseIdMap = new Map<string, string>()
      for (const phase of original.phases) {
        const newPhase = await tx.trainingPhase.create({
          data: {
            programId: newProgram.id,
            weekStart: phase.weekStart,
            weekEnd: phase.weekEnd,
            name: phase.name,
            description: phase.description,
            color: phase.color,
            orderIndex: phase.orderIndex,
          },
        })
        phaseIdMap.set(phase.id, newPhase.id)
      }

      // 3. Create workouts with exercises and map old IDs
      const workoutIdMap = new Map<string, string>()
      const workoutExerciseIdMap = new Map<string, string>()

      for (const workout of original.workouts) {
        const newWorkout = await tx.workout.create({
          data: {
            programId: newProgram.id,
            name: workout.name,
            icon: workout.icon,
            orderIndex: workout.orderIndex,
          },
        })
        workoutIdMap.set(workout.id, newWorkout.id)

        for (const we of workout.exercises) {
          const newWe = await tx.workoutExercise.create({
            data: {
              workoutId: newWorkout.id,
              exerciseId: we.exerciseId,
              orderIndex: we.orderIndex,
              hasWarmup: we.hasWarmup,
              warmupConfig: we.warmupConfig,
              feeder1Config: we.feeder1Config,
              feeder2Config: we.feeder2Config,
            },
          })
          workoutExerciseIdMap.set(we.id, newWe.id)
        }
      }

      // 4. Create phase exercise configs with mapped IDs
      for (const phase of original.phases) {
        for (const config of phase.phaseExerciseConfigs) {
          const newPhaseId = phaseIdMap.get(config.phaseId)
          const newWeId = workoutExerciseIdMap.get(config.workoutExerciseId)
          if (newPhaseId && newWeId) {
            await tx.phaseExerciseConfig.create({
              data: {
                phaseId: newPhaseId,
                workoutExerciseId: newWeId,
                workingSetConfig: config.workingSetConfig,
                backoffConfig: config.backoffConfig,
              },
            })
          }
        }
      }

      // 5. Create rotations with slots
      for (const rotation of original.rotations) {
        const newRotation = await tx.weeklyRotation.create({
          data: {
            programId: newProgram.id,
            label: rotation.label,
            orderIndex: rotation.orderIndex,
          },
        })

        for (const slot of rotation.slots) {
          await tx.rotationSlot.create({
            data: {
              rotationId: newRotation.id,
              dayOfWeek: slot.dayOfWeek,
              workoutId: slot.workoutId
                ? workoutIdMap.get(slot.workoutId) || null
                : null,
              isRest: slot.isRest,
              displayLabel: slot.displayLabel,
            },
          })
        }
      }

      // 6. Create tips
      for (const tip of original.tips) {
        await tx.programTip.create({
          data: {
            programId: newProgram.id,
            title: tip.title,
            icon: tip.icon,
            text: tip.text,
            orderIndex: tip.orderIndex,
          },
        })
      }

      return newProgram
    })

    return jsonResponse(duplicated, 201)
  } catch (error) {
    console.error('Erro ao duplicar programa:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}
