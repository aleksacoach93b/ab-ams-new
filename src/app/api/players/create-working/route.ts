import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Working player creation request received')

    const body = await request.json()
    console.log('📝 Request body:', body)

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      position,
      jerseyNumber,
      dateOfBirth,
    } = body

    const playerName = `${firstName} ${lastName}`.trim()

    console.log('📝 Processing player:', {
      playerName,
      email,
      phone,
      position,
      jerseyNumber,
      dateOfBirth
    })

    if (!playerName || !email || !password) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      console.log('❌ Email already exists:', email)
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('🔐 Password hashed successfully')

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: playerName,
        role: UserRole.PLAYER,
        isActive: true,
      },
    })

    console.log('✅ User created:', user.id)

    // Create player
    const player = await prisma.player.create({
      data: {
        name: playerName,
        email,
        phone,
        position,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        userId: user.id,
      },
    })

    console.log('✅ Player created successfully:', player.id)

    return NextResponse.json(player, { status: 201 })

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
