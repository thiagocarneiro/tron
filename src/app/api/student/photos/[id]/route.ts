import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const { id } = await params

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const photo = await prisma.progressPhoto.findUnique({
    where: { id },
  })

  if (!photo) {
    return errorResponse('Foto não encontrada', 404)
  }

  if (photo.studentId !== profile.id) {
    return errorResponse('Acesso negado', 403)
  }

  await prisma.progressPhoto.delete({
    where: { id },
  })

  return jsonResponse({ message: 'Foto removida com sucesso' })
}
