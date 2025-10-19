import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlayerStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating player (new endpoint)')
    
    const body = await request.json()
    const { firstName, lastName, email, phone, position, jerseyNumber } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Create player without file upload
    const player = await prisma.player.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email: email || null,
        phone: phone || null,
        position: position || null,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        status: PlayerStatus.ACTIVE
      }
    })

    console.log('✅ Player created successfully:', player.id)

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating player:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
