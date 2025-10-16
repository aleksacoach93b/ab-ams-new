import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const getEventColor = (type: string) => {
  switch (type) {
    case 'TRAINING': return '#F59E0B' // Orange
    case 'MATCH': return '#EF4444' // Red
    case 'MEETING': return '#3B82F6' // Blue
    case 'MEDICAL': return '#10B981' // Green
    case 'RECOVERY': return '#8B5CF6' // Purple
    default: return '#6B7280' // Gray
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Find the event first
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    const {
      title,
      description,
      type,
      date,
      startTime,
      endTime,
      location,
    } = body

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { message: 'Title and date are required' },
        { status: 400 }
      )
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        type: (type && ['TRAINING', 'MATCH', 'MEETING', 'RECOVERY', 'MEAL', 'COFFEE', 'OTHER'].includes(type.toUpperCase())) 
          ? type.toUpperCase() 
          : 'TRAINING',
        date: new Date(date),
        startTime: startTime || '00:00',
        endTime: endTime || '23:59',
        location: location || null,
        iconName: type || 'Calendar',
      },
      include: {
        participants: {
          include: {
            player: true,
            staff: true,
          }
        }
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
