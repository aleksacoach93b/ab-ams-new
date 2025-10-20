import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing all working endpoints...')

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Test admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    console.log('✅ Admin user found:', adminUser ? adminUser.email : 'Not found')

    // Test players
    const players = await prisma.player.findMany({
      take: 5,
      select: { id: true, name: true, imageUrl: true }
    })
    console.log('✅ Players found:', players.length)

    // Test events
    const events = await prisma.event.findMany({
      take: 5,
      select: { id: true, title: true, type: true }
    })
    console.log('✅ Events found:', events.length)

    // Test report folders
    const folders = await prisma.reportFolder.findMany({
      take: 5,
      select: { id: true, name: true }
    })
    console.log('✅ Report folders found:', folders.length)

    // Test coach notes
    const notes = await prisma.coachNote.findMany({
      take: 5,
      select: { id: true, title: true }
    })
    console.log('✅ Coach notes found:', notes.length)

    return NextResponse.json({
      message: 'All tests passed!',
      status: 'success',
      data: {
        database: 'connected',
        adminUser: adminUser ? adminUser.email : 'Not found',
        players: players.length,
        events: events.length,
        folders: folders.length,
        notes: notes.length
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
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
