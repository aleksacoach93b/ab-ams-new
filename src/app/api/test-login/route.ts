import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function GET() {
  try {
    // Find a player to test with
    const player = await prisma.player.findFirst({
      include: {
        user: true
      }
    })

    if (!player) {
      return NextResponse.json({ message: 'No players found' }, { status: 404 })
    }

    // Generate a test token
    const token = generateToken({
      userId: player.user.id,
      email: player.user.email,
      role: player.user.role,
    })

    return NextResponse.json({
      message: 'Test login successful',
      token,
      user: {
        id: player.user.id,
        email: player.user.email,
        role: player.user.role,
        player: {
          id: player.id,
          name: player.name,
          position: player.position
        }
      }
    })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { message: 'Test login failed' },
      { status: 500 }
    )
  }
}
