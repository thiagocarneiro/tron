import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  try {
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!trainerProfile) {
      return errorResponse('Perfil de treinador não encontrado', 404)
    }

    const { page, limit, skip } = getPaginationParams(request)

    const [programs, total] = await Promise.all([
      prisma.trainingProgram.findMany({
        where: { createdById: trainerProfile.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          workouts: { select: { id: true } },
          assignments: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      }),
      prisma.trainingProgram.count({
        where: { createdById: trainerProfile.id },
      }),
    ])

    const data = programs.map((program) => ({
      id: program.id,
      name: program.name,
      description: program.description,
      durationWeeks: program.durationWeeks,
      isTemplate: program.isTemplate,
      workoutCount: program.workouts.length,
      assignedStudents: program.assignments.length,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    }))

    return jsonResponse({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar programas:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, 'TRAINER')
  if (auth instanceof Response) return auth

  try {
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: auth.user.userId },
    })

    if (!trainerProfile) {
      return errorResponse('Perfil de treinador não encontrado', 404)
    }

    const body = await request.json()
    const { name, description, durationWeeks, isTemplate } = body

    if (!name || !durationWeeks) {
      return errorResponse('name e durationWeeks são obrigatórios', 400)
    }

    if (typeof durationWeeks !== 'number' || durationWeeks < 1) {
      return errorResponse('durationWeeks deve ser um número maior que 0', 400)
    }

    const program = await prisma.trainingProgram.create({
      data: {
        name,
        description: description || null,
        durationWeeks,
        isTemplate: isTemplate || false,
        createdById: trainerProfile.id,
      },
    })

    return jsonResponse(program, 201)
  } catch (error) {
    console.error('Erro ao criar programa:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
