import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Folder ID is required' },
        { status: 400 }
      )
    }

    const folder = await prisma.reportFolder.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: {
            isActive: true
          },
          include: {
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
          }
        },
        reports: {
          where: {
            isActive: true
          },
          include: {
            visibility: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        visibility: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { message: 'Folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Error fetching folder:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, visibility } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Folder ID is required' },
        { status: 400 }
      )
    }

    // Update the folder
    const folder = await prisma.reportFolder.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        updatedAt: new Date()
      },
      include: {
        parent: true,
        children: true,
        reports: true,
        visibility: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }
      }
    })

    // Update visibility permissions if provided
    if (visibility && Array.isArray(visibility)) {
      // Delete existing visibility records for this folder
      await prisma.reportVisibility.deleteMany({
        where: {
          folderId: id
        }
      })

      // Create new visibility records
      for (const vis of visibility) {
        await prisma.reportVisibility.create({
          data: {
            folderId: id,
            userId: vis.userId,
            canView: vis.canView !== undefined ? vis.canView : true,
            canEdit: vis.canEdit !== undefined ? vis.canEdit : false,
            canDelete: vis.canDelete !== undefined ? vis.canDelete : false
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Folder updated successfully',
      folder
    })
  } catch (error) {
    console.error('Error updating folder:', error)
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
        { message: 'Folder ID is required' },
        { status: 400 }
      )
    }

    // Soft delete the folder
    await prisma.reportFolder.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Folder deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
