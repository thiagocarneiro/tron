import { SignJWT, jwtVerify } from 'jose'
import { hash, compare } from 'bcryptjs'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-change-me')
  if (!secret) throw new Error('JWT_SECRET must be set in production')
  return new TextEncoder().encode(secret)
}

function getJwtRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-refresh-secret-change-me')
  if (!secret) throw new Error('JWT_REFRESH_SECRET must be set in production')
  return new TextEncoder().encode(secret)
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getJwtSecret())
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtRefreshSecret())
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret())
  return payload as unknown as JWTPayload
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtRefreshSecret())
  return payload as unknown as JWTPayload
}
