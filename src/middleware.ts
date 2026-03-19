import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/refresh']
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? 'MISSING_JWT_SECRET' : 'dev-secret-change-me')
)

async function verifyToken(token: string): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as { id: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next()
  }

  // Check auth cookie
  const token = request.cookies.get('tron-auth-token')?.value

  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    // For pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify JWT and extract role
  const payload = await verifyToken(token)

  if (!payload) {
    // Token is invalid or expired
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))

    // Clear the invalid cookie
    response.cookies.delete('tron-auth-token')
    return response
  }

  // Role-based access control for student pages/API
  if (pathname.startsWith('/aluno') || pathname.startsWith('/api/student')) {
    if (payload.role !== 'STUDENT') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/professor/dashboard', request.url))
    }
  }

  // Role-based access control for trainer pages/API
  if (pathname.startsWith('/professor') || pathname.startsWith('/api/trainer')) {
    if (payload.role !== 'TRAINER') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/aluno/treinos', request.url))
    }
  }

  // Attach user info to headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.id)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
