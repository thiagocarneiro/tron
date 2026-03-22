import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole } from '@/lib/api-utils'
import { scheduleSchema, validateAlternation } from '@/lib/schedule-validation'

async function getActiveAssignment(userId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } })
  if (!profile) return null

  return prisma.programAssignment.findFirst({
    where: { studentId: profile.id, isActive: true },
    include: {
      program: {
        include: {
          workouts: { select: { id: true, category: true } },
        },
      },
      schedule: {
        include: {
          slots: {
            orderBy: { dayOfWeek: 'asc' },
            include: {
              workout: { select: { id: true, name: true, icon: true, category: true, orderIndex: true } },
            },
          },
        },
      },
    },
  })
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const assignment = await getActiveAssignment(auth.user.userId)
  if (!assignment) {
    return errorResponse('Nenhum programa ativo encontrado', 404)
  }

  if (!assignment.schedule) {
    return errorResponse('Nenhum calendario configurado', 404)
  }

  return jsonResponse({
    data: {
      id: assignment.schedule.id,
      slots: assignment.schedule.slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        workoutId: s.workoutId,
        workoutName: s.workout?.name || null,
        workoutIcon: s.workout?.icon || null,
        workoutCategory: s.workout?.category || null,
        workoutOrderIndex: s.workout?.orderIndex ?? null,
        isRest: s.isRest,
      })),
    },
  })
}

export async function PUT(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const body = await request.json()
  const parsed = scheduleSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'Dados invalidos', 400)
  }

  const assignment = await getActiveAssignment(auth.user.userId)
  if (!assignment) {
    return errorResponse('Nenhum programa ativo encontrado', 404)
  }

  const { slots } = parsed.data

  // Verify all workoutIds belong to this program
  const programWorkoutIds = new Set(assignment.program.workouts.map(w => w.id))
  for (const slot of slots) {
    if (slot.workoutId && !programWorkoutIds.has(slot.workoutId)) {
      return errorResponse('Treino nao pertence ao programa ativo', 400)
    }
  }

  // Build category map and validate alternation
  const categoryMap = new Map<string, string | null>()
  for (const w of assignment.program.workouts) {
    categoryMap.set(w.id, w.category)
  }

  const validation = validateAlternation(slots, categoryMap)
  if (!validation.valid) {
    return errorResponse(validation.error!, 400)
  }

  // Upsert schedule in a transaction
  const schedule = await prisma.$transaction(async (tx) => {
    // Delete existing schedule if any
    if (assignment.schedule) {
      await tx.studentScheduleSlot.deleteMany({
        where: { scheduleId: assignment.schedule.id },
      })
      await tx.studentSchedule.delete({
        where: { id: assignment.schedule.id },
      })
    }

    // Create new schedule with slots
    return tx.studentSchedule.create({
      data: {
        assignmentId: assignment.id,
        slots: {
          create: slots.map(s => ({
            dayOfWeek: s.dayOfWeek,
            workoutId: s.workoutId,
            isRest: s.isRest,
          })),
        },
      },
      include: {
        slots: {
          orderBy: { dayOfWeek: 'asc' },
          include: {
            workout: { select: { id: true, name: true, icon: true, category: true, orderIndex: true } },
          },
        },
      },
    })
  })

  return jsonResponse({
    data: {
      id: schedule.id,
      slots: schedule.slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        workoutId: s.workoutId,
        workoutName: s.workout?.name || null,
        workoutIcon: s.workout?.icon || null,
        workoutCategory: s.workout?.category || null,
        workoutOrderIndex: s.workout?.orderIndex ?? null,
        isRest: s.isRest,
      })),
    },
  })
}
