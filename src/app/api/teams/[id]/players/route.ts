import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/teams/[id]/players - Assign players to a team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { playerIds } = body

    if (!playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json(
        { error: 'Player IDs array is required' },
        { status: 400 }
      )
    }

    // Update players to assign them to the team
    const updatedPlayers = await prisma.player.updateMany({
      where: {
        id: {
          in: playerIds
        }
      },
      data: {
        teamId: params.id
      }
    })

    return NextResponse.json({
      message: `${updatedPlayers.count} players assigned to team`,
      updatedCount: updatedPlayers.count
    })
  } catch (error) {
    console.error('Error assigning players to team:', error)
    return NextResponse.json(
      { error: 'Failed to assign players to team' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id]/players - Remove players from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { playerIds } = body

    if (!playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json(
        { error: 'Player IDs array is required' },
        { status: 400 }
      )
    }

    // Remove players from the team by setting teamId to null
    const updatedPlayers = await prisma.player.updateMany({
      where: {
        id: {
          in: playerIds
        },
        teamId: params.id
      },
      data: {
        teamId: null
      }
    })

    return NextResponse.json({
      message: `${updatedPlayers.count} players removed from team`,
      updatedCount: updatedPlayers.count
    })
  } catch (error) {
    console.error('Error removing players from team:', error)
    return NextResponse.json(
      { error: 'Failed to remove players from team' },
      { status: 500 }
    )
  }
}
