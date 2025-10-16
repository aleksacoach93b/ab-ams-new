import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const parentId = searchParams.get('parentId')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      isActive: true
    }

    if (parentId) {
      whereClause.parentId = parentId
    } else {
      whereClause.parentId = null // Root level folders
    }

    // Get folders that the user has access to
    const folders = await prisma.reportFolder.findMany({
      where: whereClause,
      include: {
        parent: true,
        children: {
          where: {
            isActive: true
          }
        },
        reports: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            reports: {
              where: {
                isActive: true
              }
            },
            children: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId, createdBy, visibility } = body

    if (!name || !createdBy) {
      return NextResponse.json(
        { message: 'Name and created by are required' },
        { status: 400 }
      )
    }

    // Create the folder
    const folder = await prisma.reportFolder.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null,
        createdBy
      },
      include: {
        parent: true,
        children: true,
        reports: true
      }
    })

    return NextResponse.json({
      message: 'Folder created successfully',
      folder
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
