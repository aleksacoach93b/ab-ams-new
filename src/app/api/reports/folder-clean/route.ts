import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    const folder = await prisma.reportFolder.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('Error creating report folder:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
