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

  const { id: exerciseId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const url = new URL(request.url)
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')))

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, name: true, muscleGroups: true },
  })

  if (!exercise) {
    return errorResponse('Exercício não encontrado', 404)
  }

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { exerciseId },
    select: { id: true },
  })

  const workoutExerciseIds = workoutExercises.map((we: { id: string }) => we.id)

  if (workoutExerciseIds.length === 0) {
    return jsonResponse({ exercise, sessions: [] })
  }

  const sets = await prisma.sessionSet.findMany({
    where: {
      workoutExerciseId: { in: workoutExerciseIds },
      session: {
        studentId: profile.id,
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      session: {
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
        },
      },
    },
  })

  const sessionMap = new Map<string, {
    sessionId: string
    date: Date
    sets: Array<{ weight: number | null; reps: number | null; rpe: number | null; setType: string; setNumber: number; completed: boolean }>
  }>()

  for (const set of sets) {
    const sessionId = set.session.id
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        sessionId,
        date: set.session.completedAt || set.session.startedAt,
        sets: [],
      })
    }
    sessionMap.get(sessionId)!.sets.push({
      weight: set.weight,
      reps: set.reps,
      rpe: set.rpe,
      setType: set.setType,
      setNumber: set.setNumber,
      completed: set.completed,
    })
  }

  const sessions = Array.from(sessionMap.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)

  for (const session of sessions) {
    session.sets.sort((a, b) => a.setNumber - b.setNumber)
  }

  return jsonResponse({ exercise, sessions })
}
