import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        user: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    })

    return NextResponse.json(coaches, { status: 200 })
  } catch (error) {
    console.error('Error fetching coaches:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
