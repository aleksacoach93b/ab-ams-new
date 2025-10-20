import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)
    
    // Test specific user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'aleksacoach@gmail.com' }
    })
    console.log('✅ Admin user found:', adminUser ? 'YES' : 'NO')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      adminUserExists: !!adminUser,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      } : null
    })
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}