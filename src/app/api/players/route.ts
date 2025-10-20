import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

    // Transform players data to match frontend expectations
    const transformedPlayers = players.map(player => {
      const nameParts = player.name ? player.name.split(' ') : ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      return {
        id: player.id,
        firstName,
        lastName,
        name: player.name,
        email: player.user?.email || '',
        position: player.position || '',
        status: player.status,
        availabilityStatus: player.availabilityStatus,
        teamId: player.teamId,
        imageUrl: player.imageUrl,
        phone: player.phone,
        dateOfBirth: player.dateOfBirth,
        jerseyNumber: player.jerseyNumber,
        team: player.team,
        user: player.user,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
      }
    })

    return NextResponse.json(transformedPlayers)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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