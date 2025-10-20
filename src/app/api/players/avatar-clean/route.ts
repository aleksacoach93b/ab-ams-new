import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    const playerId = formData.get('playerId') as string

    if (!file || !playerId) {
      return NextResponse.json(
        { message: 'File and player ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    // Update player with base64 image
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { imageUrl: base64Image },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar: base64Image,
      player: updatedPlayer,
    })

  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { message: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
