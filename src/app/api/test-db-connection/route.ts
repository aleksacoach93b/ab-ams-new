import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const userCount = await prisma.user.count()
    
    // Test if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        userCount,
        adminExists: !!adminUser,
        adminEmail: adminUser?.email || 'No admin found',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
