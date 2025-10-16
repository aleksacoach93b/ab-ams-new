import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const players = await prisma.player.findMany({
      include: {
        user: true,
        team: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      position,
      jerseyNumber,
      dateOfBirth,
    } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists. Please use a different email address.' },
        { status: 400 }
      )
    }

    // Create user account first
    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        role: UserRole.PLAYER,
        isActive: true,
      },
    })

    // Create player profile
    const player = await prisma.player.create({
      data: {
        name,
        email,
        phone,
        position,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        status: 'ACTIVE',
        userId: user.id,
      },
      include: {
        user: true,
        team: true,
      },
    })

    return NextResponse.json(
      { message: 'Player created successfully', player },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
