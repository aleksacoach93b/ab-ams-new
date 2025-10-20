import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
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
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      position,
      permissions = [],
    } = body

    const staffName = `${firstName} ${lastName}`.trim()

    if (!staffName || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: staffName,
        role: UserRole.STAFF,
        isActive: true,
      },
    })

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        name: staffName,
        email,
        phone,
        position,
        permissions: permissions,
        userId: user.id,
      },
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