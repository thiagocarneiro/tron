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

  const fullProfile = await prisma.studentProfile.findUnique({
    where: { id: profile.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  })

  return jsonResponse(fullProfile)
}

export async function PUT(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  try {
    const body = await request.json()
    const { name, height, birthDate, gender, phone } = body

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
      },
    })

    const updatedProfile = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        ...(height !== undefined && { height: height !== null ? parseFloat(height) : null }),
        ...(birthDate !== undefined && { birthDate: birthDate !== null ? new Date(birthDate) : null }),
        ...(gender !== undefined && { gender }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    })

    return jsonResponse(updatedProfile)
  } catch (error) {
    return errorResponse('Erro ao atualizar perfil', 500)
  }
}
