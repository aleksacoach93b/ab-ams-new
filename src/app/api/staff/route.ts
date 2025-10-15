import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      position,
      department,
      experience,
      certifications,
      permissions
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'First name, last name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'STAFF',
        isActive: true
      }
    })

    // Create staff record with permissions
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        position,
        department,
        experience: experience ? parseInt(experience) : null,
        certifications: certifications ? JSON.stringify(certifications) : null,
        // Set permissions
        canCreateEvents: permissions?.canCreateEvents || false,
        canEditEvents: permissions?.canEditEvents || false,
        canDeleteEvents: permissions?.canDeleteEvents || false,
        canViewAllPlayers: permissions?.canViewAllPlayers !== undefined ? permissions.canViewAllPlayers : true,
        canEditPlayers: permissions?.canEditPlayers || false,
        canDeletePlayers: permissions?.canDeletePlayers || false,
        canAddPlayerMedia: permissions?.canAddPlayerMedia || false,
        canEditPlayerMedia: permissions?.canEditPlayerMedia || false,
        canDeletePlayerMedia: permissions?.canDeletePlayerMedia || false,
        canAddPlayerNotes: permissions?.canAddPlayerNotes || false,
        canEditPlayerNotes: permissions?.canEditPlayerNotes || false,
        canDeletePlayerNotes: permissions?.canDeletePlayerNotes || false,
        canViewCalendar: permissions?.canViewCalendar !== undefined ? permissions.canViewCalendar : true,
        canViewDashboard: permissions?.canViewDashboard !== undefined ? permissions.canViewDashboard : true,
        canManageStaff: permissions?.canManageStaff || false,
        canViewReports: permissions?.canViewReports || false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
