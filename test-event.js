const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEventCreation() {
  try {
    console.log('Testing event creation...')
    
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'Test Description',
        type: 'TRAINING',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        locationId: null,
        teamId: null,
        coachId: null,
        isRecurring: false,
        isAllDay: false,
        allowPlayerCreation: false,
        allowPlayerReschedule: false,
        color: '#3B82F6',
        icon: 'Calendar',
      },
    })
    
    console.log('Event created successfully:', event)
  } catch (error) {
    console.error('Error creating event:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEventCreation()
