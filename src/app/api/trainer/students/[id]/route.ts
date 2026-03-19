import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole } from '@/lib/api-utils'

async function getTrainerProfileAndVerifyStudent(
  userId: string,
  studentId: string
) {
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: { userId },
  })

  if (!trainerProfile) {
    return { error: errorResponse('Perfil de treinador não encontrado', 404) }
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  })

  if (!student) {
    return { error: errorResponse('Aluno não encontrado', 404) }
  }

  if (student.trainerId !== trainerProfile.id) {
    return { error: errorResponse('Este aluno não pertence a você', 403) }
  }

  return { trainerProfile, student }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const result = await getTrainerProfileAndVerifyStudent(
      auth.user.userId,
      id
    )
    if ('error' in result) return result.error

    const studentFull = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
            phone: true,
            createdAt: true,
          },
        },
        assignedPrograms: {
          where: { isActive: true },
          include: {
            program: { select: { id: true, name: true, durationWeeks: true } },
          },
          take: 1,
        },
        workoutSessions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          include: {
            workout: { select: { name: true } },
          },
        },
        personalRecords: {
          include: {
            exercise: { select: { name: true } },
          },
        },
        bodyMeasurements: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    if (!studentFull) {
      return errorResponse('Aluno não encontrado', 404)
    }

    const totalSessions = await prisma.workoutSession.count({
      where: { studentId: id },
    })

    const ratingsAgg = await prisma.workoutSession.aggregate({
      where: { studentId: id, rating: { not: null } },
      _avg: { rating: true },
    })

    // Calculate streak: consecutive days with sessions ending from today going backwards
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId: id },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    })

    let streak = 0
    if (sessions.length > 0) {
      const sessionDates = new Set(
        sessions.map((s) => s.startedAt.toISOString().split('T')[0])
      )
      const today = new Date()
      const checkDate = new Date(today)
      checkDate.setHours(0, 0, 0, 0)

      // If no session today, start from yesterday
      const todayStr = checkDate.toISOString().split('T')[0]
      if (!sessionDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1)
      }

      while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }

    const activeProgram = studentFull.assignedPrograms[0] || null

    return jsonResponse({
      id: studentFull.id,
      profile: {
        birthDate: studentFull.birthDate,
        gender: studentFull.gender,
        height: studentFull.height,
        startDate: studentFull.startDate,
      },
      user: studentFull.user,
      activeProgram: activeProgram
        ? {
            id: activeProgram.id,
            programId: activeProgram.program.id,
            programName: activeProgram.program.name,
            durationWeeks: activeProgram.program.durationWeeks,
            startDate: activeProgram.startDate,
          }
        : null,
      recentSessions: studentFull.workoutSessions.map((s) => ({
        id: s.id,
        workoutName: s.workout.name,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        duration: s.duration,
        rating: s.rating,
        rpe: s.rpe,
        notes: s.notes,
        trainerNote: s.trainerNote,
      })),
      personalRecords: studentFull.personalRecords.map((pr) => ({
        id: pr.id,
        exerciseName: pr.exercise.name,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
      })),
      latestBodyMeasurement: studentFull.bodyMeasurements[0] || null,
      stats: {
        totalSessions,
        averageRating: ratingsAgg._avg.rating || null,
        streak,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar detalhes do aluno:', error)
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
    const result = await getTrainerProfileAndVerifyStudent(
      auth.user.userId,
      id
    )
    if ('error' in result) return result.error

    const body = await request.json()
    const { sessionId, note } = body

    if (!sessionId || !note) {
      return errorResponse('sessionId e note são obrigatórios', 400)
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return errorResponse('Sessão não encontrada', 404)
    }

    if (session.studentId !== id) {
      return errorResponse('Esta sessão não pertence a este aluno', 403)
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { trainerNote: note },
    })

    return jsonResponse({
      id: updatedSession.id,
      trainerNote: updatedSession.trainerNote,
    })
  } catch (error) {
    console.error('Erro ao adicionar nota do treinador:', error)
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
    const result = await getTrainerProfileAndVerifyStudent(
      auth.user.userId,
      id
    )
    if ('error' in result) return result.error

    const body = await request.json()
    const { programId, startDate } = body

    if (!programId || !startDate) {
      return errorResponse('programId e startDate são obrigatórios', 400)
    }

    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return errorResponse('Programa não encontrado', 404)
    }

    if (program.createdById !== result.trainerProfile.id) {
      return errorResponse('Este programa não pertence a você', 403)
    }

    // Deactivate existing active assignments for this student
    await prisma.programAssignment.updateMany({
      where: { studentId: id, isActive: true },
      data: { isActive: false },
    })

    const assignment = await prisma.programAssignment.create({
      data: {
        studentId: id,
        programId,
        startDate: new Date(startDate),
        isActive: true,
      },
    })

    return jsonResponse(assignment, 201)
  } catch (error) {
    console.error('Erro ao atribuir programa ao aluno:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
