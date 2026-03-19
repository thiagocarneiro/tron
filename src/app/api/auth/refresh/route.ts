import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = refreshSchema.safeParse(body)

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ')
      return errorResponse(message, 400)
    }

    const { refreshToken } = validation.data

    let payload
    try {
      payload = await verifyRefreshToken(refreshToken)
    } catch {
      return errorResponse('Refresh token inválido ou expirado', 401)
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!storedToken) {
      return errorResponse('Refresh token não encontrado', 401)
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      })
      return errorResponse('Refresh token expirado', 401)
    }

    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })

    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }

    const newAccessToken = await signAccessToken(tokenPayload)
    const newRefreshToken = await signRefreshToken(tokenPayload)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt,
      },
    })

    return jsonResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
