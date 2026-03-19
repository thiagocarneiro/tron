import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.substring(7)
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Não autorizado', 401)
  }
  return { user }
}

export async function requireRole(request: NextRequest, ...roles: string[]): Promise<{ user: JWTPayload } | NextResponse> {
  const result = await requireAuth(request)
  if (result instanceof NextResponse) return result

  if (!roles.includes(result.user.role)) {
    return errorResponse('Acesso negado', 403)
  }
  return result
}

export function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
