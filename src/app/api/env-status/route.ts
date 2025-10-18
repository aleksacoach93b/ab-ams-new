import { NextResponse } from 'next/server'

export async function GET() {
  const envStatus = {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Missing',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Missing',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ? 'Set' : 'Missing'
  }

  const missingCount = Object.values(envStatus).filter(status => status === 'Missing').length

  return NextResponse.json({
    status: missingCount === 0 ? 'success' : 'error',
    message: missingCount === 0 ? 'All environment variables are set' : `${missingCount} environment variables are missing`,
    environment: envStatus,
    timestamp: new Date().toISOString()
  })
}
