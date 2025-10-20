import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    // Simple base64 decode for now
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    return payload
  } catch {
    return null
  }
}

export function generateToken(payload: { userId: string; email: string; role: string }): string {
  // Simple base64 encode for now
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}