import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupProduction() {
  try {
    console.log('🚀 Setting up production database...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Connected to Supabase database successfully!')
    
    // Run database migrations
    console.log('🔄 Running database migrations...')
    // Note: In production, migrations should be run via: npx prisma migrate deploy
    
    // Test if tables exist
    try {
      const userCount = await prisma.user.count()
      console.log('✅ User table exists, count:', userCount)
    } catch (error) {
      console.log('❌ User table does not exist. Run migrations first!')
      console.log('Run: npx prisma migrate deploy')
      throw error
    }
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      console.log('🔑 Password: Teodor06022025')
    } else {
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
    }

    console.log('🎉 Production setup completed successfully!')
    console.log('🌐 Your app should be accessible at: https://ab-ams.vercel.app')

  } catch (error) {
    console.error('❌ Production setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupProduction()
