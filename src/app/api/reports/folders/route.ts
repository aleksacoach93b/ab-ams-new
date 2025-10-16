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

    // Get folders that the user has visibility to
    const folders = await prisma.reportFolder.findMany({
      where: {
        ...whereClause,
        OR: [
          // Folders where user has explicit visibility
          {
            visibility: {
              some: {
                userId: userId,
                canView: true
              }
            }
          },
          // Folders created by the user (always visible to creator)
          {
            createdBy: userId
          }
        ]
      },
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
            title: true,
            createdAt: true
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

    // Set visibility permissions if provided
    if (visibility && Array.isArray(visibility)) {
      for (const vis of visibility) {
        await prisma.reportVisibility.create({
          data: {
            folderId: folder.id,
            userId: vis.userId,
            canView: vis.canView !== undefined ? vis.canView : true,
            canEdit: vis.canEdit !== undefined ? vis.canEdit : false,
            canDelete: vis.canDelete !== undefined ? vis.canDelete : false
          }
        })
      }
    } else {
      // If no explicit visibility is provided, automatically share with staff who have canViewReports permission
      const staffWithReportsPermission = await prisma.staff.findMany({
        where: {
          canViewReports: true,
          isActive: true
        },
        select: {
          userId: true
        }
      })

      // Create visibility entries for all staff with reports permission (including the creator)
      for (const staff of staffWithReportsPermission) {
        await prisma.reportVisibility.create({
          data: {
            folderId: folder.id,
            userId: staff.userId,
            canView: true,
            canEdit: staff.userId === createdBy, // Creator can edit
            canDelete: staff.userId === createdBy // Creator can delete
          }
        })
      }
    }

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
