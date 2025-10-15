import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Player ID is required' },
        { status: 400 }
      )
    }

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `player_${id}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update player avatar in database
    const avatarUrl = `/uploads/avatars/${fileName}`
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      player: updatedPlayer,
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
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

    if (!id) {
      return NextResponse.json(
        { message: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Get current player to find avatar path
    const player = await prisma.player.findUnique({
      where: { id },
      select: { avatar: true },
    })

    if (!player) {
      return NextResponse.json(
        { message: 'Player not found' },
        { status: 404 }
      )
    }

    // Remove avatar from database
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: { avatar: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    })

    // Optionally delete the file from disk
    if (player.avatar) {
      try {
        const { unlink } = await import('fs/promises')
        const filePath = join(process.cwd(), 'public', player.avatar)
        if (existsSync(filePath)) {
          await unlink(filePath)
        }
      } catch (fileError) {
        console.error('Error deleting avatar file:', fileError)
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      message: 'Avatar removed successfully',
      player: updatedPlayer,
    })
  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
