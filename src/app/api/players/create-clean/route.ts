import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    if (!playerName || !email || !password) {
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
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

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

    return NextResponse.json(player, { status: 201 })

  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
