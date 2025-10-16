import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Staff creation request received')
    
    // Ensure database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const {
      name,
      email,
      password,
      phone,
      position,
    } = body

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Validation failed: missing required fields')
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Email already exists:', email)
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    console.log('👤 Creating user account...')
    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STAFF',
        isActive: true
      }
    })
    console.log('✅ User created:', user.id)

    console.log('👔 Creating staff record...')
    // Create staff record
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name,
        email,
        phone,
        position,
        canViewReports: false,
        canEditReports: false,
        canDeleteReports: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      }
    })
    console.log('✅ Staff created:', staff.id)

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating staff:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error.message,
        details: {
          code: (error as any)?.code,
          meta: (error as any)?.meta
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
