import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Get client information for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (!email || !password) {
      // Log failed attempt (missing credentials)
      await logLoginAttempt({
        email: email || 'unknown',
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Missing credentials'
      })
      
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        player: true,
        coach: true,
        staff: true
      }
    })

    if (!user) {
      // Log failed attempt (user not found)
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'User not found'
      })
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      // Log failed attempt (account deactivated)
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Account deactivated',
        userId: user.id,
        userRole: user.role,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        userAvatar: user.avatar
      })
      
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '')
    
    if (!isValidPassword) {
      // Log failed attempt (invalid password)
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Invalid password',
        userId: user.id,
        userRole: user.role,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        userAvatar: user.avatar
      })
      
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
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

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Log successful login
    await logLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: true,
      userId: user.id,
      userRole: user.role,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userAvatar: user.avatar
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to log login attempts
async function logLoginAttempt({
  email,
  ipAddress,
  userAgent,
  success,
  failureReason,
  userId,
  userRole,
  userFirstName,
  userLastName,
  userAvatar
}: {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  userId?: string
  userRole?: string
  userFirstName?: string
  userLastName?: string
  userAvatar?: string | null
}) {
  try {
    await prisma.loginLog.create({
      data: {
        userId: userId || 'unknown',
        email,
        role: (userRole as any) || 'UNKNOWN',
        firstName: userFirstName || 'Unknown',
        lastName: userLastName || 'User',
        avatar: userAvatar,
        ipAddress,
        userAgent,
        success,
        failureReason
      }
    })
  } catch (error) {
    console.error('Error logging login attempt:', error)
  }
}