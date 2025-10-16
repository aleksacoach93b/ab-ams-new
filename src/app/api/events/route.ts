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
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            date: 'asc'
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
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            date: 'asc'
          }
        })
      } else {
        // For coaches and admins, show all events
        events = await prisma.event.findMany({
          include: {
            participants: {
              include: {
                player: true,
                staff: true,
              },
            },
            media: true,
          },
          orderBy: {
            date: 'asc'
          }
        })
      }
    } else {
      // If no user filter, show all events (for admin/coach views)
      events = await prisma.event.findMany({
        include: {
          participants: {
            include: {
              player: true,
              staff: true,
            },
          },
          media: true,
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
    console.log('🔍 Event creation request received')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const {
      title,
      description = '',
      type = 'TRAINING',
      date,
      startTime = '10:00',
      endTime = '11:00',
      location = '',
      selectedPlayers = [], // Array of player IDs
      selectedStaff = [], // Array of staff IDs
    } = body

    // Validate required fields
    if (!title || !date) {
      console.log('❌ Validation failed: missing title or date')
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      )
    }

    console.log('📅 Creating event with data:', {
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      selectedPlayers,
      selectedStaff
    })

    // Create event first without participants
    const eventData = {
      title,
      description,
      type: (type && Object.values(EventType).includes(type.toUpperCase() as EventType)) 
        ? type.toUpperCase() as EventType 
        : EventType.TRAINING,
      date: new Date(date),
      startTime: startTime || '00:00',
      endTime: endTime || '23:59',
      location: location || null,
      iconName: type || 'Calendar',
    }

    const event = await prisma.event.create({
      data: eventData
    })

    console.log('✅ Event created successfully:', event.id)

    // Add participants if any
    if (selectedPlayers.length > 0 || selectedStaff.length > 0) {
      console.log('👥 Adding participants...')
      
      const participantData = [
        // Add selected players
        ...selectedPlayers.map((playerId: string) => ({
          eventId: event.id,
          playerId: playerId,
        })),
        // Add selected staff
        ...selectedStaff.map((staffId: string) => ({
          eventId: event.id,
          staffId: staffId,
        }))
      ]

      if (participantData.length > 0) {
        await prisma.eventParticipant.createMany({
          data: participantData
        })
        console.log('✅ Participants added successfully')
      }
    }

    // Fetch the complete event with participants
    const completeEvent = await prisma.event.findUnique({
      where: { id: event.id },
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
      { message: 'Event created successfully', event: completeEvent },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error creating event:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          code: (error as any)?.code,
          meta: (error as any)?.meta
        }
      },
      { status: 500 }
    )
  }
}
