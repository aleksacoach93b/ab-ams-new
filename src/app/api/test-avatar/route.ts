import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing avatar data...')

    // Get all players with their imageUrl
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
      }
    })

    console.log('📊 Players with avatars:', players.map(p => ({
      id: p.id,
      name: p.name,
      hasImage: !!p.imageUrl,
      imageLength: p.imageUrl ? p.imageUrl.length : 0
    })))

    return NextResponse.json({
      message: 'Avatar test completed',
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        hasImage: !!p.imageUrl,
        imageLength: p.imageUrl ? p.imageUrl.length : 0
      }))
    })

  } catch (error) {
    console.error('❌ Error testing avatars:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
