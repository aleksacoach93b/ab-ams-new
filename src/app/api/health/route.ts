import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🏥 Health check started')
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
      },
      message: 'API is working on Vercel!'
    })
    
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
      }
    }, { status: 500 })
  }
}
