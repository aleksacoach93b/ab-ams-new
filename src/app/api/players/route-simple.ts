import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole, PlayerStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Simple player creation request received')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const {
      firstName,
      lastName,
      name,
      email,
      password,
      phone,
      position,
      jerseyNumber,
    } = body

    // Use name if provided, otherwise combine firstName and lastName
    const playerName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : '')

    console.log('🔍 Extracted fields:', { firstName, lastName, name: playerName, email, password: password ? '***' : 'missing', phone, position, jerseyNumber })

    // Validate required fields
    if (!playerName || !email || !password) {
      console.log('❌ Validation failed: missing required fields')
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Validation failed: password too short')
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('🔐 Creating user account...')
    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: playerName,
        role: UserRole.PLAYER,
        isActive: true
      }
    })
    console.log('✅ User created:', user.id)

    console.log('⚽ Creating player profile...')
    // Create player profile
    const player = await prisma.player.create({
      data: {
        name: playerName,
        email,
        phone: phone || null,
        position: position || null,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        status: PlayerStatus.ACTIVE,
        userId: user.id
      }
    })

    console.log('✅ Player created successfully:', player.id)

    return NextResponse.json({
      message: 'Player created successfully',
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        position: player.position,
        status: player.status,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating player:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
