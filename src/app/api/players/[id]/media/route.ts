import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { MediaType } from '@prisma/client'

export async function GET(
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

    // Get player media files from database
    const mediaFiles = await prisma.playerMedia.findMany({
      where: { playerId: id },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(mediaFiles)
  } catch (error) {
    console.error('Error fetching player media:', error)
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
        { message: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id }
    })

    if (!player) {
      return NextResponse.json(
        { message: 'Player not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'players', id)
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedFiles = []

    for (const file of files) {
      if (file.size === 0) continue

      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = join(uploadDir, fileName)

      // Save file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Determine media type based on file type
      let mediaType: MediaType = MediaType.OTHER
      if (file.type.startsWith('image/')) {
        mediaType = MediaType.IMAGE
      } else if (file.type.startsWith('video/')) {
        mediaType = MediaType.VIDEO
      } else if (file.type.startsWith('audio/')) {
        mediaType = MediaType.AUDIO
      } else if (file.type === 'application/pdf' || file.type.includes('document')) {
        mediaType = MediaType.DOCUMENT
      }

      // Save file info to database
      const mediaFile = await prisma.playerMedia.create({
        data: {
          playerId: id,
          name: file.name,
          type: mediaType,
          url: `/uploads/players/${id}/${fileName}`,
          size: file.size,
          mimeType: file.type,
          uploadedBy: 'system', // TODO: Get from auth context
        }
      })

      uploadedFiles.push({
        id: mediaFile.id,
        fileName: mediaFile.name,
        fileType: mediaFile.mimeType,
        fileSize: mediaFile.size,
        uploadDate: mediaFile.uploadedAt.toISOString(),
        url: mediaFile.url,
      })
    }

    return NextResponse.json(uploadedFiles, { status: 201 })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
