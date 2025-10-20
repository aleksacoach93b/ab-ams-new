import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function generateToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}