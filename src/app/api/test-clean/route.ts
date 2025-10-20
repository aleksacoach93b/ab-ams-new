import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()

    // Test admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    // Test players
    const players = await prisma.player.findMany({
      take: 5,
      select: { id: true, name: true }
    })

    // Test events
    const events = await prisma.event.findMany({
      take: 5,
      select: { id: true, title: true }
    })

    return NextResponse.json({
      message: 'All tests passed!',
      status: 'success',
      data: {
        database: 'connected',
        adminUser: adminUser ? adminUser.email : 'Not found',
        players: players.length,
        events: events.length
      }
    })

  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json(
      {
        message: 'Test failed',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
