import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
        createdAt: true,
        studentProfile: {
          include: {
            trainer: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        trainerProfile: true,
      },
    })

    if (!user) {
      return errorResponse('Usuário não encontrado', 404)
    }

    return jsonResponse({ user })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
