import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
    // Test admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'aleksacoach@gmail.com' }
    })
    
    if (admin) {
      console.log('✅ Admin user found:', admin.firstName, admin.lastName)
    } else {
      console.log('❌ Admin user not found')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      adminExists: !!admin,
      adminName: admin ? `${admin.firstName} ${admin.lastName}` : null,
      environment: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        jwtSecretSet: !!process.env.JWT_SECRET
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        jwtSecretSet: !!process.env.JWT_SECRET
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
