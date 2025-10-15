import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const { id: eventId, mediaId } = await params

    if (!eventId || !mediaId) {
      return NextResponse.json(
        { message: 'Event ID and Media ID are required' },
        { status: 400 }
      )
    }

    // Get media record to find file path
    const media = await prisma.eventMedia.findUnique({
      where: { id: mediaId },
    })

    if (!media) {
      return NextResponse.json(
        { message: 'Media not found' },
        { status: 404 }
      )
    }

    // Verify the media belongs to the event
    if (media.eventId !== eventId) {
      return NextResponse.json(
        { message: 'Media does not belong to this event' },
        { status: 403 }
      )
    }

    // Delete media record from database
    await prisma.eventMedia.delete({
      where: { id: mediaId },
    })

    // Delete the file from disk
    try {
      const filePath = join(process.cwd(), 'public', media.url)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (fileError) {
      console.error('Error deleting media file:', fileError)
      // Don't fail the request if file deletion fails
    }

    return NextResponse.json({
      message: 'Media deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting event media:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
