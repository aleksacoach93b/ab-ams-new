import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    let events

    if (userId && userRole) {
      // Filter events based on user participation
      if (userRole === 'PLAYER') {
        // First, find the player by userId or by email
        const player = await prisma.player.findFirst({
          where: {
            OR: [
              { userId: userId },
              { user: { id: userId } }
            ]
          }
        })

        if (!player) {
          return NextResponse.json([])
        }

        // Find events where the player is a participant
        events = await prisma.event.findMany({
          where: {
            participants: {
              some: {
                playerId: player.id
              }
            }
          },
          include: {
            participants: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    position: true,
                    imageUrl: true
                  }
                }
              }
            },
            media: true
          },
          orderBy: {
            date: 'asc'
          }
        })
      } else {
        // For coaches and admins, return all events
        events = await prisma.event.findMany({
          include: {
            participants: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    position: true,
                    imageUrl: true
                  }
                }
              }
            },
            media: true
          },
          orderBy: {
            date: 'asc'
          }
        })
      }
    } else {
      // Return all events if no user filter
      events = await prisma.event.findMany({
        include: {
          participants: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  position: true,
                  imageUrl: true
                }
              }
            }
          },
          media: true
        },
        orderBy: {
          date: 'asc'
        }
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description = '',
      type = 'TRAINING',
      date,
      startTime = '10:00',
      endTime = '11:00',
      location = '',
      icon = 'dumbbell-realistic',
      selectedPlayers = [],
      selectedStaff = [],
    } = body

    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: type as EventType,
        date: new Date(date),
        startTime,
        endTime,
        location,
        iconName: icon,
      },
    })

    // Add participants if any
    if (selectedPlayers.length > 0) {
      await prisma.eventParticipant.createMany({
        data: selectedPlayers.map((playerId: string) => ({
          eventId: event.id,
          playerId: playerId,
        })),
      })
    }

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}