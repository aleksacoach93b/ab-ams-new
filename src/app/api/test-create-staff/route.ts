import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const testEmail = `test-staff-${Date.now()}@example.com`
    const testPassword = 'TestPassword123'

    // Create test user
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Staff',
        role: 'STAFF'
      }
    })

    // Create test staff
    const testStaff = await prisma.staff.create({
      data: {
        userId: testUser.id,
        firstName: 'Test',
        lastName: 'Staff',
        position: 'Test Position',
        department: 'Test Department'
      }
    })

    // Clean up - delete test data
    await prisma.staff.delete({
      where: { id: testStaff.id }
    })
    
    await prisma.user.delete({
      where: { id: testUser.id }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Staff creation test successful',
      testStaffId: testStaff.id
    })

  } catch (error) {
    console.error('Staff creation test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Staff creation test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
