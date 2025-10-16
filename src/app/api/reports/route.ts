import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { writeFile, mkdir } from 'fs/promises'
// import { join } from 'path'
// import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const folderId = searchParams.get('folderId')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      isActive: true
    }

    if (folderId && folderId.trim() !== '') {
      whereClause.folderId = folderId
    } else {
      // When no folderId is provided, only show reports at root level (no folder assigned)
      whereClause.folderId = null
    }

    // Get reports that the user has visibility to
    const reports = await prisma.report.findMany({
      where: {
        ...whereClause,
        OR: [
          // Reports where user has explicit visibility
          {
            visibility: {
              some: {
                userId: userId,
                canView: true
              }
            }
          },
          // Reports created by the user (always visible to creator)
          {
            createdBy: userId
          }
        ]
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const folderIdRaw = formData.get('folderId') as string
    const createdBy = formData.get('createdBy') as string
    const file = formData.get('file') as File

    // Convert 'null' string to actual null for root level reports
    const folderId = folderIdRaw === 'null' || folderIdRaw === '' ? null : folderIdRaw

    if (!title || !createdBy || !file) {
      return NextResponse.json(
        { message: 'Title, created by, and file are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images, videos, audio, documents, and archives are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const { writeFile, mkdir } = await import('fs/promises')
    const { join } = await import('path')
    const { existsSync } = await import('fs')
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `report_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create report record
    const fileUrl = `/uploads/reports/${fileName}`
    
    const report = await prisma.report.create({
      data: {
        title,
        description: description || null,
        folderId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        createdBy,
        visibility: {
          create: {
            userId: createdBy,
            canView: true,
            canEdit: true,
            canDelete: true
          }
        }
      },
      include: {
        folder: true
      }
    })

    // Automatically share with staff who have canViewReports permission
    const staffWithReportsPermission = await prisma.staff.findMany({
      where: {
        canViewReports: true,
        isActive: true
      },
      select: {
        userId: true
      }
    })

    // Create visibility entries for all staff with reports permission (excluding the creator)
    for (const staff of staffWithReportsPermission) {
      if (staff.userId !== createdBy) {
        await prisma.reportVisibility.create({
          data: {
            reportId: report.id,
            userId: staff.userId,
            canView: true,
            canEdit: false,
            canDelete: false
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Report uploaded successfully',
      report
    })
  } catch (error) {
    console.error('Error uploading report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
