import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Testing login for:', email)
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', user.firstName, user.lastName)
    console.log('👑 Role:', user.role)
    console.log('🔐 Has password:', !!user.password)

    // Check password
    if (!user.password) {
      console.log('❌ User has no password set')
      return NextResponse.json(
        { message: 'User has no password set' },
        { status: 400 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    console.log('✅ Password is valid!')

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('❌ Login test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}