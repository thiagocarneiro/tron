import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

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
    const {
      date,
      weight,
      bodyFat,
      chest,
      waist,
      hips,
      leftArm,
      rightArm,
      leftThigh,
      rightThigh,
      leftCalf,
      rightCalf,
      neck,
      shoulders,
    } = body

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        studentId: profile.id,
        date: date ? new Date(date) : new Date(),
        weight: weight ?? null,
        bodyFat: bodyFat ?? null,
        chest: chest ?? null,
        waist: waist ?? null,
        hips: hips ?? null,
        leftArm: leftArm ?? null,
        rightArm: rightArm ?? null,
        leftThigh: leftThigh ?? null,
        rightThigh: rightThigh ?? null,
        leftCalf: leftCalf ?? null,
        rightCalf: rightCalf ?? null,
        neck: neck ?? null,
        shoulders: shoulders ?? null,
      },
    })

    return jsonResponse(measurement, 201)
  } catch {
    return errorResponse('Erro ao criar medição corporal', 500)
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const url = new URL(request.url)
  const chart = url.searchParams.get('chart')

  if (chart === 'true') {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { studentId: profile.id },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        weight: true,
        bodyFat: true,
        chest: true,
        waist: true,
        hips: true,
        leftArm: true,
        rightArm: true,
      },
    })

    return jsonResponse(measurements)
  }

  const { page, limit, skip } = getPaginationParams(request)

  const [measurements, total] = await Promise.all([
    prisma.bodyMeasurement.findMany({
      where: { studentId: profile.id },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.bodyMeasurement.count({
      where: { studentId: profile.id },
    }),
  ])

  return jsonResponse({
    data: measurements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
