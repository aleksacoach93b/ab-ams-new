import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Test creating a simple event
    const testEvent = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        location: 'Test Location',
        type: 'TRAINING',
        status: 'SCHEDULED',
        isAllDay: false,
        isRecurring: false,
        allowPlayerCreation: false,
        allowPlayerReschedule: false
      }
    })

    // Clean up - delete the test event
    await prisma.event.delete({
      where: { id: testEvent.id }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Event creation test successful',
      testEventId: testEvent.id
    })

  } catch (error) {
    console.error('Event creation test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Event creation test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
