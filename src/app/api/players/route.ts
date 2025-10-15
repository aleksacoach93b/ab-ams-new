import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Use raw SQL to avoid Prisma enum issues
    const players = await prisma.$queryRaw`
      SELECT 
        p.*,
        u.id as userId,
        u.email as userEmail,
        u.role as userRole,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.avatar as userAvatar,
        u.isActive as userIsActive,
        u.emailVerified as userEmailVerified,
        u.lastLoginAt as userLastLoginAt,
        u.createdAt as userCreatedAt,
        u.updatedAt as userUpdatedAt,
        t.id as teamId,
        t.name as teamName,
        t.logo as teamLogo,
        t.color as teamColor,
        t.description as teamDescription,
        t.isActive as teamIsActive,
        t.createdAt as teamCreatedAt,
        t.updatedAt as teamUpdatedAt
      FROM players p
      LEFT JOIN users u ON p.userId = u.id
      LEFT JOIN teams t ON p.teamId = t.id
      ORDER BY p.createdAt DESC
    `

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
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
      jerseyNumber,
      height,
      weight,
      preferredFoot,
      nationality,
      currentAddress,
      birthCity,
      birthCountry,
      bloodType,
      medicalNotes,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'First name, last name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists. Please use a different email address.' },
        { status: 400 }
      )
    }

    // Create user account first
    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        role: UserRole.PLAYER,
        firstName,
        lastName,
        isActive: true,
        emailVerified: false,
      },
    })

    // Create player profile
    const player = await prisma.player.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        position,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        preferredFoot,
        nationality,
        currentAddress,
        birthCity,
        birthCountry,
        bloodType,
        medicalNotes,
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        user: true,
        team: true,
      },
    })

    return NextResponse.json(
      { message: 'Player created successfully', player },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
