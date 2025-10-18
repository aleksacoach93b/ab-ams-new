import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔍 Testing events API...')
    
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

    console.log('✅ Event created successfully:', testEvent.id)

    // Clean up - delete the test event
    await prisma.event.delete({
      where: { id: testEvent.id }
    })

    console.log('✅ Test event cleaned up')

    return NextResponse.json({
      status: 'success',
      message: 'Events API test successful',
      testEventId: testEvent.id
    })

  } catch (error) {
    console.error('❌ Events API test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Events API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
