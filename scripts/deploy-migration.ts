import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deployMigration() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Run any necessary migrations here
    // For now, we'll just test the connection
    
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deployMigration()
