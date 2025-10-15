import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/teams - Get all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      where: {
        isActive: true
      },
      include: {
        players: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true
          }
        },
        coaches: {
          where: {
            isActive: true
          },
          include: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        events: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          select: {
            id: true
          }
        },
        _count: {
          select: {
            events: {
              where: {
                type: 'MATCH'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      color: team.color || '#dc2626',
      description: team.description || '',
      playerCount: team.players.length,
      coachCount: team.coaches.length,
      upcomingMatches: team.events.length,
      wins: 0, // TODO: Calculate from actual match results
      losses: 0, // TODO: Calculate from actual match results
      draws: 0, // TODO: Calculate from actual match results
      players: team.players,
      coaches: team.coaches
    }))

    return NextResponse.json(transformedTeams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, logo } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        color: color || '#dc2626',
        logo
      }
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
