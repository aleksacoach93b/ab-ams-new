import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing event creation on Vercel...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test simple event creation
    const testEvent = await prisma.event.create({
      data: {
        title: 'Test Event from Vercel',
        description: 'Testing event creation',
        type: 'TRAINING',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        location: 'Test Location',
        iconName: 'Calendar'
      }
    })
    
    console.log('✅ Event created successfully:', testEvent.id)
    
    return NextResponse.json({
      success: true,
      message: 'Event creation test successful',
      eventId: testEvent.id,
      event: testEvent
    })
    
  } catch (error) {
    console.error('❌ Event creation test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: (error as any)?.code,
        meta: (error as any)?.meta,
        stack: error.stack
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
