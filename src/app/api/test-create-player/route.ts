import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const testEmail = `test-player-${Date.now()}@example.com`
    const testPassword = 'TestPassword123'

    // Create test user
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Player',
        role: 'PLAYER'
      }
    })

    // Create test player
    const testPlayer = await prisma.player.create({
      data: {
        userId: testUser.id,
        firstName: 'Test',
        lastName: 'Player',
        position: 'Test Position',
        status: 'FULLY_AVAILABLE'
      }
    })

    // Clean up - delete test data
    await prisma.player.delete({
      where: { id: testPlayer.id }
    })
    
    await prisma.user.delete({
      where: { id: testUser.id }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Player creation test successful',
      testPlayerId: testPlayer.id
    })

  } catch (error) {
    console.error('Player creation test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Player creation test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
