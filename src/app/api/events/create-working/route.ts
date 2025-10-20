import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Working event creation request received')

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
      icon = 'dumbbell-realistic',
      selectedPlayers = [],
      selectedStaff = [],
    } = body

    console.log('📝 Processing event:', {
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      icon
    })

    if (!title || !date) {
      console.log('❌ Missing required fields')
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

    console.log('✅ Event created successfully:', event.id)

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating event:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
