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
  )

  if (!currentPhase) {
    const lastPhase = assignment.program.phases[assignment.program.phases.length - 1]
    if (lastPhase && currentWeek > lastPhase.weekEnd) {
      return jsonResponse({
        phase: lastPhase,
        currentWeek,
        weekInPhase: currentWeek - lastPhase.weekStart + 1,
        programCompleted: true,
      })
    }
    return errorResponse('Nenhuma fase encontrada para a semana atual', 404)
  }

  const weekInPhase = currentWeek - currentPhase.weekStart + 1

  return jsonResponse({
    phase: currentPhase,
    currentWeek,
    weekInPhase,
    programCompleted: false,
  })
}
