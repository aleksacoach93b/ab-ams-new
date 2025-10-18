import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function seedProduction() {
  try {
    console.log('🌱 Starting production seed...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Teodor06022025', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'aleksacoach@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Password: Teodor06022025')

  } catch (error) {
    console.error('❌ Production seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedProduction()
