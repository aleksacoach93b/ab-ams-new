import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Simple login request received')
    
    const { email, password } = await request.json()
    console.log('🔐 Login attempt for:', email)

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
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ User found:', user.email, user.role)

    if (!user.isActive) {
      console.log('❌ User account is inactive')
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Check password
    let isValidPassword = false
    
    if (user.password) {
      // Check if it's a bcrypt hash or plain text
      if (user.password.startsWith('$2')) {
        // It's a bcrypt hash
        isValidPassword = await bcrypt.compare(password, user.password)
      } else {
        // It's plain text
        isValidPassword = password === user.password
      }
    }
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Password valid for:', email)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date()
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('✅ Login successful for:', email)

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
