import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-utils'
import { NextResponse } from 'next/server'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const validation = changePasswordSchema.safeParse(body)

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ')
      return errorResponse(message, 400)
    }

    const { currentPassword, newPassword } = validation.data

    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
    })

    if (!user) {
      return errorResponse('Usuário não encontrado', 404)
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash)

    if (!isCurrentPasswordValid) {
      return errorResponse('Senha atual incorreta', 401)
    }

    const newPasswordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    return jsonResponse({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
