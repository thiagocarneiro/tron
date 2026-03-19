import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

async function verifySetOwnership(sessionId: string, setId: string, studentId: string) {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    return { error: errorResponse('Sessão não encontrada', 404) }
  }

  if (session.studentId !== studentId) {
    return { error: errorResponse('Acesso negado', 403) }
  }

  const set = await prisma.sessionSet.findUnique({
    where: { id: setId },
  })

  if (!set) {
    return { error: errorResponse('Set não encontrado', 404) }
  }

  if (set.sessionId !== sessionId) {
    return { error: errorResponse('Set não pertence a esta sessão', 400) }
  }

  return { session, set }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id: sessionId, setId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const ownership = await verifySetOwnership(sessionId, setId, profile.id)
  if ('error' in ownership) return ownership.error

  try {
    const body = await request.json()
    const { weight, reps, rpe, completed, notes } = body

    const updatedSet = await prisma.sessionSet.update({
      where: { id: setId },
      data: {
        ...(weight !== undefined && { weight }),
        ...(reps !== undefined && { reps }),
        ...(rpe !== undefined && { rpe }),
        ...(completed !== undefined && { completed }),
        ...(notes !== undefined && { notes }),
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

    return jsonResponse(updatedSet)
  } catch (error) {
    return errorResponse('Erro ao atualizar set', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id: sessionId, setId } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const ownership = await verifySetOwnership(sessionId, setId, profile.id)
  if ('error' in ownership) return ownership.error

  try {
    await prisma.sessionSet.delete({
      where: { id: setId },
    })

    return jsonResponse({ message: 'Set removido com sucesso' })
  } catch (error) {
    return errorResponse('Erro ao remover set', 500)
  }
}
