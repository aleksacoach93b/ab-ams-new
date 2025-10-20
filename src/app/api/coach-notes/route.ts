import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch coach notes
    const notes = await prisma.coachNote.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        visibleToStaff: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching coach notes:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, isPinned } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      )
    }

    const note = await prisma.coachNote.create({
      data: {
        title,
        content,
        isPinned: isPinned || false,
        authorId: 'admin-001', // Default admin ID
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating coach note:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}