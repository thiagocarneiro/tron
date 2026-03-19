import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyPassword, signAccessToken, signRefreshToken } from '@/lib/auth'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ')
      return errorResponse(message, 400)
    }

    const { email, password } = validation.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return errorResponse('Credenciais inválidas', 401)
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return errorResponse('Credenciais inválidas', 401)
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await signAccessToken(tokenPayload)
    const refreshToken = await signRefreshToken(tokenPayload)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    return jsonResponse({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
