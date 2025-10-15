import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id, mediaId } = await params

    if (!id || !mediaId) {
      return NextResponse.json(
        { message: 'Player ID and Media ID are required' },
        { status: 400 }
      )
    }

    // Get media file from database
    const mediaFile = await prisma.playerMedia.findFirst({
      where: {
        id: mediaId,
        playerId: id
      }
    })

    if (!mediaFile) {
      return NextResponse.json(
        { message: 'Media file not found' },
        { status: 404 }
      )
    }

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', mediaFile.url)
      await unlink(filePath)
    } catch (error) {
      console.warn('File not found on disk:', error)
      // Continue with database deletion even if file doesn't exist
    }

    // Delete from database
    await prisma.playerMedia.delete({
      where: { id: mediaId }
    })

    return NextResponse.json(
      { message: 'Media file deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting media file:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
