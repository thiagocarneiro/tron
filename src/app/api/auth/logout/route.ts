import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const validation = logoutSchema.safeParse(body)

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ')
      return errorResponse(message, 400)
    }

    const { refreshToken } = validation.data

    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
        userId: authResult.user.userId,
      },
    })

    return jsonResponse({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    console.error('Erro no logout:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
