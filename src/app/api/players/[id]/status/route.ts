import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id || !body.status) {
      return NextResponse.json(
        { message: 'Player ID and status are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Updating player ${id} availabilityStatus to: ${body.status}`)
    
    // Update the availabilityStatus field instead of status
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { availabilityStatus: body.status },
      select: {
        id: true,
        name: true,
        availabilityStatus: true,
        status: true
      }
    })

    console.log(`✅ Successfully updated player ${id} availabilityStatus to: ${body.status}`)

    return NextResponse.json({
      message: 'Player status updated successfully',
      playerId: id,
      status: body.status,
      player: updatedPlayer
    })

  } catch (error) {
    console.error('Error updating player status:', error)
    return NextResponse.json(
      { message: 'Failed to update player status', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
