import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  try {
    const { page, limit, skip } = getPaginationParams(request)
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const muscleGroup = url.searchParams.get('muscleGroup') || ''

    const where: Record<string, unknown> = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (muscleGroup) {
      where.muscleGroups = { has: muscleGroup }
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.exercise.count({ where }),
    ])

    return jsonResponse({
      data: exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  try {
    const body = await request.json()
    const { name, equipmentOptions, muscleGroups, videoUrl, instructions, imageUrl } = body

    if (!name) {
      return errorResponse('name é obrigatório', 400)
    }

    if (muscleGroups && !Array.isArray(muscleGroups)) {
      return errorResponse('muscleGroups deve ser um array', 400)
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        equipmentOptions: equipmentOptions || null,
        muscleGroups: muscleGroups || [],
        videoUrl: videoUrl || null,
        instructions: instructions || null,
        imageUrl: imageUrl || null,
      },
    })

    return jsonResponse(exercise, 201)
  } catch (error) {
    console.error('Erro ao criar exercício:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
