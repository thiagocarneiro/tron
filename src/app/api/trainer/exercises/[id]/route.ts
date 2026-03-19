import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole } from '@/lib/api-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    })

    if (!exercise) {
      return errorResponse('Exercício não encontrado', 404)
    }

    const body = await request.json()
    const { name, equipmentOptions, muscleGroups, videoUrl, instructions, imageUrl } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (equipmentOptions !== undefined) updateData.equipmentOptions = equipmentOptions
    if (muscleGroups !== undefined) {
      if (!Array.isArray(muscleGroups)) {
        return errorResponse('muscleGroups deve ser um array', 400)
      }
      updateData.muscleGroups = muscleGroups
    }
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (instructions !== undefined) updateData.instructions = instructions
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    if (Object.keys(updateData).length === 0) {
      return errorResponse('Nenhum campo para atualizar', 400)
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: updateData,
    })

    return jsonResponse(updated)
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        workoutExercises: { select: { id: true }, take: 1 },
      },
    })

    if (!exercise) {
      return errorResponse('Exercício não encontrado', 404)
    }

    if (exercise.workoutExercises.length > 0) {
      return errorResponse(
        'Não é possível excluir este exercício pois ele está sendo usado em treinos',
        409
      )
    }

    await prisma.exercise.delete({
      where: { id },
    })

    return jsonResponse({ message: 'Exercício excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir exercício:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
