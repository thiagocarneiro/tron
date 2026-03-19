import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

const VALID_ANGLES = ['FRONT', 'SIDE', 'BACK'] as const
const MAX_BASE64_SIZE = 6.6 * 1024 * 1024

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  try {
    const body = await request.json()
    const { imageData, angle, notes, date } = body

    if (!imageData || typeof imageData !== 'string') {
      return errorResponse('Dados da imagem são obrigatórios', 400)
    }

    if (!angle || !VALID_ANGLES.includes(angle)) {
      return errorResponse('Ângulo inválido. Use FRONT, SIDE ou BACK', 400)
    }

    if (imageData.length > MAX_BASE64_SIZE) {
      return errorResponse('Imagem muito grande. Tamanho máximo: 5MB', 400)
    }

    const photo = await prisma.progressPhoto.create({
      data: {
        studentId: profile.id,
        imageUrl: imageData,
        angle: angle as (typeof VALID_ANGLES)[number],
        date: date ? new Date(date) : new Date(),
        notes: notes ?? null,
      },
    })

    return jsonResponse({
      id: photo.id,
      studentId: photo.studentId,
      angle: photo.angle,
      date: photo.date,
      notes: photo.notes,
    }, 201)
  } catch {
    return errorResponse('Erro ao salvar foto de progresso', 500)
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const photos = await prisma.progressPhoto.findMany({
    where: { studentId: profile.id },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      angle: true,
      date: true,
      notes: true,
      imageUrl: true,
    },
  })

  return jsonResponse(photos)
}
