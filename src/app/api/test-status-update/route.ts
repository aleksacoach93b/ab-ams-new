import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { playerId, status } = await request.json()

    if (!playerId || !status) {
      return NextResponse.json(
        { message: 'Player ID and status are required' },
        { status: 400 }
      )
    }

    console.log(`🧪 Testing status update for player ${playerId} to status: ${status}`)

    // Get the player before update
    const playerBefore = await prisma.player.findUnique({
      where: { id: playerId }
    })

    console.log(`📊 Player before update:`, { id: playerBefore?.id, status: playerBefore?.status })

    // Try to update the status
    try {
      const updatedPlayer = await prisma.player.update({
        where: { id: playerId },
        data: { status: status as any },
        include: {
          user: true,
          team: true
        }
      })

      console.log(`✅ Direct update successful:`, { id: updatedPlayer.id, status: updatedPlayer.status })

      return NextResponse.json({
        message: 'Status update test successful',
        before: { id: playerBefore?.id, status: playerBefore?.status },
        after: { id: updatedPlayer.id, status: updatedPlayer.status },
        requested: status,
        success: true
      })
    } catch (updateError) {
      console.error('❌ Direct update failed:', updateError)

      // Try raw SQL
      try {
        await prisma.$executeRaw`
          UPDATE players 
          SET status = ${status}::text::"PlayerStatus"
          WHERE id = ${playerId}
        `

        const playerAfter = await prisma.player.findUnique({
          where: { id: playerId }
        })

        console.log(`✅ Raw SQL update successful:`, { id: playerAfter?.id, status: playerAfter?.status })

        return NextResponse.json({
          message: 'Status update test successful with raw SQL',
          before: { id: playerBefore?.id, status: playerBefore?.status },
          after: { id: playerAfter?.id, status: playerAfter?.status },
          requested: status,
          method: 'raw_sql',
          success: true
        })
      } catch (rawSqlError) {
        console.error('❌ Raw SQL update also failed:', rawSqlError)

        return NextResponse.json({
          message: 'Status update test failed',
          before: { id: playerBefore?.id, status: playerBefore?.status },
          requested: status,
          errors: {
            directUpdate: updateError.message,
            rawSql: rawSqlError.message
          },
          success: false
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Error in test status update:', error)
    return NextResponse.json({
      message: 'Error in test status update',
      error: error.message
    }, { status: 500 })
  }
}
