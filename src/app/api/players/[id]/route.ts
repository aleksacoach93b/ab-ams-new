import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Player ID is required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        user: true,
        team: true
      }
    })

    if (!player) {
      return NextResponse.json(
        { message: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Player ID is required' },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      position,
      jerseyNumber,
      status
    } = body

    // First, get the player to find the associated user
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { message: 'Player not found' },
        { status: 404 }
      )
    }

    // Update user password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      await prisma.user.update({
        where: { id: existingPlayer.userId },
        data: {
          password: await hashPassword(password)
        }
      })
    }

    // Update player data
    const player = await prisma.player.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        position,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        status
      },
      include: {
        user: true,
        team: true
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params

    console.log('Attempting to delete player:', playerId)

    // Use direct SQL to avoid Prisma enum issues
    const player = await prisma.$queryRaw`
      SELECT p.*, u.id as userId 
      FROM players p 
      LEFT JOIN users u ON p.userId = u.id 
      WHERE p.id = ${playerId}
    `

    if (!player || (Array.isArray(player) && player.length === 0)) {
      console.log('Player not found:', playerId)
      return NextResponse.json(
        { message: 'Player not found' },
        { status: 404 }
      )
    }

    const playerData = Array.isArray(player) ? player[0] : player
    console.log('Found player:', playerData.name, 'User ID:', playerData.userId)

    // Delete the player record using direct SQL
    await prisma.$executeRaw`DELETE FROM players WHERE id = ${playerId}`

    // Delete the associated user record
    await prisma.$executeRaw`DELETE FROM users WHERE id = ${playerData.userId}`

    console.log('Successfully deleted player:', playerId)

    return NextResponse.json(
      { message: 'Player deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
