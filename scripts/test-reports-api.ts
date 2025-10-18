import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testReportsQuery() {
  try {
    console.log('🧪 Testing reports query...')
    
    // Test the exact query from the API
    const whereClause = {
      isActive: true,
      folderId: null  // Root level reports
    }
    
    console.log('Where clause:', whereClause)
    
    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        folder: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('✅ Query successful!')
    console.log('Found reports:', reports.length)
    reports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.name} (folder: ${report.folder?.name || 'none'})`)
    })
    
  } catch (error) {
    console.error('❌ Query failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
  } finally {
    await prisma.$disconnect()
  }
}

testReportsQuery()
