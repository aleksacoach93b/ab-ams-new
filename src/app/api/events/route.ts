import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

const getEventColor = (type: string) => {
  switch (type) {
    case 'TRAINING': return '#F59E0B' // Orange
    case 'MATCH': return '#EF4444' // Red
    case 'MEETING': return '#3B82F6' // Blue
    case 'MEDICAL': return '#10B981' // Green
    case 'RECOVERY': return '#8B5CF6' // Purple
    case 'MEAL': return '#F97316' // Orange-red
    case 'COFFEE': return '#92400E' // Brown
    default: return '#6B7280' // Gray
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    let events

    if (userId && userRole) {
      // Filter events based on user participation
      if (userRole === 'PLAYER') {
        // Find events where the player is a participant
        events = await prisma.event.findMany({
          where: {
            participants: {
              some: {
                player: {
                  userId: userId
                }
              }
            }
          },
          include: {
            location: true,
            team: true,
            coach: true,
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            startTime: 'asc'
          }
        })
      } else if (userRole === 'STAFF') {
        // Find events where the staff is a participant
        events = await prisma.event.findMany({
          where: {
            participants: {
              some: {
                staff: {
                  userId: userId
                }
              }
            }
          },
          include: {
            location: true,
            team: true,
            coach: true,
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            startTime: 'asc'
          }
        })
      } else {
        // For coaches and admins, show all events
        events = await prisma.event.findMany({
          include: {
            location: true,
            team: true,
            coach: true,
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            startTime: 'asc'
          }
        })
      }
    } else {
      // If no user filter, show all events (for admin/coach views)
      events = await prisma.event.findMany({
        include: {
          location: true,
          team: true,
          coach: true,
          participants: {
            include: {
              player: true,
              staff: true,
            },
          },
          media: true,
        },
        orderBy: {
          startTime: 'asc'
        }
      })
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      isAllDay,
      isRecurring,
      allowPlayerCreation,
      allowPlayerReschedule,
      icon,
    } = body

    // Validate required fields
    if (!id || !title || !date) {
      return NextResponse.json(
        { message: 'ID, title and date are required' },
        { status: 400 }
      )
    }

    // Create start and end datetime - use local timezone
    const [year, month, day] = date.split('-').map(Number)
    const [startHour, startMin] = (startTime || '00:00').split(':').map(Number)
    const [endHour, endMin] = (endTime || '23:59').split(':').map(Number)
    
    const startDate = new Date(year, month - 1, day, startHour, startMin, 0)
    const endDate = new Date(year, month - 1, day, endHour, endMin, 0)

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        type: (type && Object.values(EventType).includes(type.toUpperCase() as EventType)) 
          ? type.toUpperCase() as EventType 
          : EventType.TRAINING,
        startTime: startDate,
        endTime: endDate,
        isRecurring: isRecurring || false,
        isAllDay: isAllDay || false,
        allowPlayerCreation: allowPlayerCreation || false,
        allowPlayerReschedule: allowPlayerReschedule || false,
        color: getEventColor(type || 'TRAINING'),
        icon: icon || 'Calendar',
      },
      include: {
        location: true,
        team: true,
        coach: true,
      },
    })

    return NextResponse.json(
      { message: 'Event updated successfully', event },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    const {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
      isAllDay,
      isRecurring,
      allowPlayerCreation,
      allowPlayerReschedule,
      icon,
      selectedPlayers = [], // Array of player IDs
      selectedStaff = [], // Array of staff IDs
    } = body

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Create start and end datetime - use local timezone
    const [year, month, day] = date.split('-').map(Number)
    const [startHour, startMin] = (startTime || '00:00').split(':').map(Number)
    const [endHour, endMin] = (endTime || '23:59').split(':').map(Number)
    
    const startDate = new Date(year, month - 1, day, startHour, startMin, 0)
    const endDate = new Date(year, month - 1, day, endHour, endMin, 0)

    // Create event with participants
    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: (type && Object.values(EventType).includes(type.toUpperCase() as EventType)) 
          ? type.toUpperCase() as EventType 
          : EventType.TRAINING,
        startTime: startDate,
        endTime: endDate,
        locationId: null, // For now, we'll handle location separately
        teamId: null, // For now, we'll handle team separately
        coachId: null, // For now, we'll handle coach separately
        isRecurring: isRecurring || false,
        isAllDay: isAllDay || false,
        allowPlayerCreation: allowPlayerCreation || false,
        allowPlayerReschedule: allowPlayerReschedule || false,
        color: getEventColor(type || 'TRAINING'),
        icon: icon || 'Calendar',
        participants: {
          create: [
            // Add selected players
            ...selectedPlayers.map((playerId: string) => ({
              playerId: playerId,
              role: 'Participant'
            })),
            // Add selected staff
            ...selectedStaff.map((staffId: string) => ({
              staffId: staffId,
              role: 'Participant'
            }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            player: true,
            staff: true,
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'Event created successfully', event },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating event:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta
    })
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
