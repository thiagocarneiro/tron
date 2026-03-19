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

  const records = await prisma.personalRecord.findMany({
    where: { studentId: profile.id },
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
    orderBy: { date: 'desc' },
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recordsWithFlag = records.map((record) => ({
    ...record,
    isNew: record.date >= sevenDaysAgo,
  }))

  return jsonResponse(recordsWithFlag)
}
