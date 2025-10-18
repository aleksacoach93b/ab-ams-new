import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database schema...')
    
    // Test if User table exists
    const userCount = await prisma.user.count()
    console.log('✅ User table exists, count:', userCount)
    
    // Test if Event table exists
    const eventCount = await prisma.event.count()
    console.log('✅ Event table exists, count:', eventCount)
    
    // Test if Player table exists
    const playerCount = await prisma.player.count()
    console.log('✅ Player table exists, count:', playerCount)
    
    // Test if Staff table exists
    const staffCount = await prisma.staff.count()
    console.log('✅ Staff table exists, count:', staffCount)
    
    // Test if Team table exists
    const teamCount = await prisma.team.count()
    console.log('✅ Team table exists, count:', teamCount)

    return NextResponse.json({
      status: 'success',
      message: 'Database schema test successful',
      data: {
        userCount,
        eventCount,
        playerCount,
        staffCount,
        teamCount
      }
    })

  } catch (error) {
    console.error('❌ Database schema test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Database schema test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
