import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing all APIs...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const results = {
      database: '✅ Connected',
      users: null,
      players: null,
      staff: null,
      events: null,
      testEventCreation: null
    }
    
    // Test users
    try {
      const userCount = await prisma.user.count()
      results.users = `✅ ${userCount} users found`
    } catch (error) {
      results.users = `❌ Error: ${error.message}`
    }
    
    // Test players
    try {
      const playerCount = await prisma.player.count()
      results.players = `✅ ${playerCount} players found`
    } catch (error) {
      results.players = `❌ Error: ${error.message}`
    }
    
    // Test staff
    try {
      const staffCount = await prisma.staff.count()
      results.staff = `✅ ${staffCount} staff found`
    } catch (error) {
      results.staff = `❌ Error: ${error.message}`
    }
    
    // Test events
    try {
      const eventCount = await prisma.event.count()
      results.events = `✅ ${eventCount} events found`
    } catch (error) {
      results.events = `❌ Error: ${error.message}`
    }
    
    // Test event creation
    try {
      const testEvent = await prisma.event.create({
        data: {
          title: 'API Test Event',
          description: 'Testing event creation',
          type: 'TRAINING',
          date: new Date(),
          startTime: '10:00',
          endTime: '11:00',
          location: 'Test Location',
          iconName: 'Calendar'
        }
      })
      results.testEventCreation = `✅ Event created with ID: ${testEvent.id}`
      
      // Clean up test event
      await prisma.event.delete({ where: { id: testEvent.id } })
      results.testEventCreation += ' (cleaned up)'
    } catch (error) {
      results.testEventCreation = `❌ Error: ${error.message}`
    }
    
    console.log('📊 Test results:', results)
    
    return NextResponse.json({
      success: true,
      message: 'API tests completed',
      results,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
      }
    })
    
  } catch (error) {
    console.error('❌ API test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
