import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Vercel deployment is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
