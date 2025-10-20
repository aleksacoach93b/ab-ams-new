import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    const whereClause: any = {
      isActive: true
    }

    if (parentId) {
      whereClause.parentId = parentId
    } else {
      whereClause.parentId = null // Root level folders
    }

    // Get folders
    const folders = await prisma.reportFolder.findMany({
      where: whereClause,
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        reports: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reports: true,
            children: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching report folders:', error)
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