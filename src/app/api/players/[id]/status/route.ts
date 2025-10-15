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

    console.log(`🔄 Updating player ${id} status to: ${body.status}`)
    
    // Simple direct SQL update
    await prisma.$executeRaw`UPDATE players SET status = ${body.status} WHERE id = ${id}`

    console.log(`✅ Successfully updated player ${id} status to: ${body.status}`)

    return NextResponse.json({
      message: 'Player status updated successfully',
      playerId: id,
      status: body.status
    })

  } catch (error) {
    console.error('Error updating player status:', error)
    return NextResponse.json(
      { message: 'Failed to update player status' },
      { status: 500 }
    )
  }
}
