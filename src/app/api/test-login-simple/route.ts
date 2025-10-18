import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const testEmail = 'aleksacoach@gmail.com'
    const testPassword = 'Teodor06022025'

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found',
        email: testEmail
      }, { status: 404 })
    }

    // Check password
    const passwordMatch = await bcrypt.compare(testPassword, user.password)

    if (!passwordMatch) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid password',
        email: testEmail
      }, { status: 401 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Login test successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Login test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Login test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
