import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { jsonResponse, errorResponse, requireRole, getPaginationParams } from '@/lib/api-utils'

const DEFAULT_WARMUP_REST = 60

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({ where: { userId } })
}

function getCurrentWeek(startDate: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - new Date(startDate).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.floor(diffDays / 7) + 1)
}

function safeParseJSON(value: string | null): Record<string, unknown> | null {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function parseRestTime(config: Record<string, unknown> | null, defaultValue: number | null = null): number | null {
  if (!config) return defaultValue
  if (typeof config.rest === 'number') return config.rest
  if (typeof config.restSeconds === 'number') return config.restSeconds
  if (typeof config.restTime === 'number') return config.restTime
  return defaultValue
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'STUDENT')
  if (auth instanceof Response) return auth

  const profile = await getStudentProfile(auth.user.userId)
  if (!profile) {
    return errorResponse('Perfil de aluno não encontrado', 404)
  }

  const assignment = await prisma.programAssignment.findFirst({
    where: { studentId: profile.id, isActive: true },
    include: {
      program: {
        include: {
          phases: {
            orderBy: { orderIndex: 'asc' },
          },
          workouts: {
            include: {
              exercises: {
                include: {
                  phaseConfigs: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!assignment) {
    return errorResponse('Nenhum programa ativo encontrado', 404)
  }

  const currentWeek = getCurrentWeek(assignment.startDate)

  const currentPhase = assignment.program.phases.find(
    (phase) => currentWeek >= phase.weekStart && currentWeek <= phase.weekEnd
  ) || assignment.program.phases[assignment.program.phases.length - 1]

  if (!currentPhase) {
    return errorResponse('Nenhuma fase encontrada para a semana atual', 404)
  }

  const restConfig: Record<string, {
    warmupRest: number
    feeder1Rest: number | null
    feeder2Rest: number | null
    workingRest: number | null
    backoffRest: number | null
  }> = {}

  for (const workout of assignment.program.workouts) {
    for (const we of workout.exercises) {
      const warmupConfig = safeParseJSON(we.warmupConfig)
      const feeder1Config = safeParseJSON(we.feeder1Config)
      const feeder2Config = safeParseJSON(we.feeder2Config)

      const phaseConfig = we.phaseConfigs.find(
        (pc) => pc.phaseId === currentPhase.id
      )

      const workingSetConfig = phaseConfig
        ? safeParseJSON(phaseConfig.workingSetConfig)
        : null
      const backoffConfig = phaseConfig
        ? safeParseJSON(phaseConfig.backoffConfig)
        : null

      restConfig[we.id] = {
        warmupRest: parseRestTime(warmupConfig, DEFAULT_WARMUP_REST) ?? DEFAULT_WARMUP_REST,
        feeder1Rest: parseRestTime(feeder1Config),
        feeder2Rest: parseRestTime(feeder2Config),
        workingRest: parseRestTime(workingSetConfig),
        backoffRest: parseRestTime(backoffConfig),
      }
    }
  }

  return jsonResponse({
    phaseId: currentPhase.id,
    phaseName: currentPhase.name,
    currentWeek,
    restConfig,
  })
}
