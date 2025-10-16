import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const staff = await prisma.staff.findUnique({
      where: { id },
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

    if (!staff) {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff member:', error)
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
    const {
      name,
      email,
      password,
      phone,
      position,
      canViewReports,
      canEditReports,
      canDeleteReports
    } = body

    // Get existing staff member
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingStaff) {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Update user data
    const userUpdateData: any = {
      email
    }

    // Update password if provided
    if (password && password.trim() !== '') {
      userUpdateData.password = await hashPassword(password)
    }

    await prisma.user.update({
      where: { id: existingStaff.userId },
      data: userUpdateData
    })

    // Update staff data
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        position,
        canViewReports: canViewReports || false,
        canEditReports: canEditReports || false,
        canDeleteReports: canDeleteReports || false
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error updating staff member:', error)
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

    // Get staff member to find user ID
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!staff) {
      return NextResponse.json(
        { message: 'Staff member not found' },
        { status: 404 }
      )
    }

    // Delete staff record (this will cascade to user due to onDelete: Cascade)
    await prisma.staff.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
