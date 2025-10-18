import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logFileAccess, getClientInfo } from '@/lib/fileAccessLogger'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Only coaches and admins can view reports
    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for folder filtering
    const whereClause: any = {
      isActive: true
    }
    
    if (folderId) {
      whereClause.folderId = folderId
    } else {
      // If no folderId specified, get reports not in any folder (root level)
      whereClause.folderId = null
    }

    // Fetch reports
    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        folder: {
          include: {
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
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Filter reports based on user role and folder access
    let filteredReports = reports
    if (user.role === 'STAFF') {
      // Get the staff member for this user
      const staffMember = await prisma.staff.findUnique({
        where: { userId: user.userId }
      })
      
      if (staffMember) {
        // Staff can only see reports from folders they have access to
        filteredReports = reports.filter(report => 
          report.folder && report.folder.visibleToStaff.some(access => 
            access.staffId === staffMember.id && access.canView
          )
        )
      } else {
        filteredReports = []
      }
    }

    // Log file access for each report viewed
    const { ipAddress, userAgent } = getClientInfo(request)
    for (const report of filteredReports) {
      await logFileAccess({
        userId: user.userId,
        fileType: 'REPORT',
        fileId: report.id,
        fileName: report.fileName,
        action: 'VIEW',
        ipAddress,
        userAgent
      })
    }

    return NextResponse.json({ reports: filteredReports })
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
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Only coaches and admins can create reports
    if (user.role !== 'ADMIN' && user.role !== 'COACH') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const descriptionRaw = formData.get('description') as string
    const description = descriptionRaw && descriptionRaw.trim() !== '' && descriptionRaw !== 'undefined' ? descriptionRaw : null
    const folderIdRaw = formData.get('folderId') as string
    const file = formData.get('file') as File

    // Convert 'null' string to actual null for root level reports
    const folderId = folderIdRaw === 'null' || folderIdRaw === '' ? null : folderIdRaw

    if (!name || !file) {
      return NextResponse.json(
        { message: 'Name and file are required' },
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

    // No thumbnail generation - keep it simple
    const thumbnailUrl = null

    // Create report record
    const fileUrl = `/uploads/reports/${fileName}`
    
    // Create the report
    const report = await prisma.report.create({
      data: {
        name: name,
        description: description || null,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
        thumbnailUrl,
        folderId,
        createdBy: user.userId,
      },
      include: {
        folder: true
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error uploading report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}