import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Simple report folder creation request received')
    
    const body = await request.json()
    const { name, description } = body

    console.log('📝 Request body:', { name, description })

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Create the folder
    const folder = await prisma.reportFolder.create({
      data: {
        name,
        description: description || null
      }
    })

    console.log('✅ Report folder created successfully:', folder.id)

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating report folder:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
