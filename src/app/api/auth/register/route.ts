import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['STUDENT', 'TRAINER'], {
    error: 'Papel deve ser STUDENT ou TRAINER',
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ')
      return errorResponse(message, 400)
    }

    const { name, email, password, role } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('Email já está em uso', 409)
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        ...(role === 'STUDENT' && {
          studentProfile: { create: {} },
        }),
        ...(role === 'TRAINER' && {
          trainerProfile: { create: {} },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return jsonResponse({ user }, 201)
  } catch (error) {
    console.error('Erro no registro:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
