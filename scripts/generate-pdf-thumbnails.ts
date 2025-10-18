import { PrismaClient } from '@prisma/client'
import { join } from 'path'
import { existsSync } from 'fs'
import { promises as fs } from 'fs'

const prisma = new PrismaClient()

async function generateThumbnailsForExistingPDFs() {
  try {
    console.log('🔍 Finding PDF reports without thumbnails...')
    
    // Find all PDF reports that don't have thumbnails
    const pdfReports = await prisma.report.findMany({
      where: {
        fileType: 'application/pdf',
        thumbnailUrl: null
      }
    })

    console.log(`📄 Found ${pdfReports.length} PDF reports without thumbnails`)

    if (pdfReports.length === 0) {
      console.log('✅ All PDF reports already have thumbnails!')
      return
    }

    // Import pdf2pic dynamically
    const { fromPath } = require('pdf2pic')
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports')
    const thumbnailDir = join(uploadsDir, 'thumbnails')
    
    // Create thumbnails directory if it doesn't exist
    if (!existsSync(thumbnailDir)) {
      await fs.mkdir(thumbnailDir, { recursive: true })
    }

    for (const report of pdfReports) {
      try {
        console.log(`🔄 Generating thumbnail for: ${report.name}`)
        
        // Get the file path from the fileUrl
        const fileName = report.fileUrl.split('/').pop()
        const filePath = join(uploadsDir, fileName!)
        
        // Check if the PDF file exists
        if (!existsSync(filePath)) {
          console.log(`⚠️  PDF file not found: ${filePath}`)
          continue
        }

        const timestamp = Date.now()
        const thumbnailFileName = `thumb_${timestamp}.png`
        const thumbnailPath = join(thumbnailDir, thumbnailFileName)
        
        const convert = fromPath(filePath, {
          density: 200,
          saveFilename: `thumb_${timestamp}`,
          savePath: thumbnailDir,
          format: 'png',
          width: 200,
          height: 300
        })
        
        const result = await convert(1, { responseType: 'image' })
        
        const thumbnailUrl = `/uploads/reports/thumbnails/${thumbnailFileName}`
        
        // Update the report with the thumbnail URL
        await prisma.report.update({
          where: { id: report.id },
          data: { thumbnailUrl }
        })
        
        console.log(`✅ Generated thumbnail for: ${report.name}`)
        
      } catch (error) {
        console.error(`❌ Error generating thumbnail for ${report.name}:`, error)
      }
    }

    console.log('🎉 Thumbnail generation complete!')
    
  } catch (error) {
    console.error('❌ Error in thumbnail generation script:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generateThumbnailsForExistingPDFs()