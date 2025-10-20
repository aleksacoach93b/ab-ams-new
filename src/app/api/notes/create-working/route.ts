import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Working notes creation request received')

    const body = await request.json()
    console.log('📝 Request body:', body)

    const { title, content, isPinned } = body

    console.log('📝 Processing note:', {
      title,
      content: content ? content.substring(0, 100) + '...' : 'No content',
      isPinned
    })

    if (!title || !content) {
      console.log('❌ Missing required fields')
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

    console.log('✅ Note created successfully:', note.id)

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating note:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
