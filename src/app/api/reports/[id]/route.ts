import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        folder: true,
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

    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
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
    const { title, description, visibility } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Update the report
    const report = await prisma.report.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        updatedAt: new Date()
      },
      include: {
        folder: true,
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
      // Delete existing visibility records for this report
      await prisma.reportVisibility.deleteMany({
        where: {
          reportId: id
        }
      })

      // Create new visibility records
      for (const vis of visibility) {
        await prisma.reportVisibility.create({
          data: {
            reportId: id,
            userId: vis.userId,
            canView: vis.canView !== undefined ? vis.canView : true,
            canEdit: vis.canEdit !== undefined ? vis.canEdit : false,
            canDelete: vis.canDelete !== undefined ? vis.canDelete : false
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Report updated successfully',
      report
    })
  } catch (error) {
    console.error('Error updating report:', error)
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
        { message: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Get the report to find the file path
    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      )
    }

    // Delete the physical file
    try {
      const filePath = join(process.cwd(), 'public', report.fileUrl)
      await unlink(filePath)
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Soft delete the report
    await prisma.report.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Report deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
