import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64 and store directly in database
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    // Update player with base64 image
    const updatedPlayer = await prisma.player.update({
      where: { id },
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
      { 
        message: 'Failed to upload avatar', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Remove avatar from player
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { imageUrl: null },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    return NextResponse.json({
      message: 'Avatar removed successfully',
      player: updatedPlayer,
    })

  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json(
      { 
        message: 'Failed to remove avatar', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}