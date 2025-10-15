import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    const mediaFiles = await prisma.eventMedia.findMany({
      where: { 
        eventId: id,
        isActive: true 
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return NextResponse.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching event media:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images, videos, audio, documents, and archives are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'events')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `event_${id}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Determine media type
    let mediaType = 'OTHER'
    if (file.type.startsWith('image/')) {
      mediaType = 'IMAGE'
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO'
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'AUDIO'
    } else if (file.type === 'application/pdf' || file.type.includes('document') || file.type === 'text/plain') {
      mediaType = 'DOCUMENT'
    }

    // Save media record to database
    const mediaUrl = `/uploads/events/${fileName}`
    const newMedia = await prisma.eventMedia.create({
      data: {
        eventId: id,
        name: file.name,
        type: mediaType as any,
        url: mediaUrl,
        size: file.size,
        mimeType: file.type,
        uploadedBy: 'system', // TODO: Get from auth context
      },
    })

    return NextResponse.json({
      message: 'Media uploaded successfully',
      media: newMedia,
    })
  } catch (error) {
    console.error('Error uploading event media:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
