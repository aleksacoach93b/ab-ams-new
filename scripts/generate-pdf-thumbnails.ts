import { PrismaClient } from '@prisma/client'
import { createPDFThumbnailFromUrl } from '../src/lib/pdf-utils'

const prisma = new PrismaClient()

async function generatePDFThumbnails() {
  console.log('🔧 Generating PDF Thumbnails...')
  
  try {
    // Get all PDF reports without thumbnails
    const pdfReports = await prisma.report.findMany({
      where: {
        fileType: 'application/pdf',
        thumbnailUrl: null,
        isActive: true
      }
    })

    console.log(`📄 Found ${pdfReports.length} PDF reports without thumbnails`)

    for (const report of pdfReports) {
      console.log(`\n🔍 Processing: "${report.title}"`)
      
      try {
        // Generate thumbnail
        const thumbnailUrl = await createPDFThumbnailFromUrl(report.fileUrl, report.createdBy)
        
        if (thumbnailUrl) {
          // Update the report with thumbnail URL
          await prisma.report.update({
            where: { id: report.id },
            data: { thumbnailUrl }
          })
          console.log(`  ✅ Thumbnail generated: ${thumbnailUrl}`)
        } else {
          console.log(`  ❌ Failed to generate thumbnail`)
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${report.title}:`, error)
      }
    }

    console.log('\n✅ PDF thumbnail generation completed!')
    
  } catch (error) {
    console.error('❌ Error generating PDF thumbnails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generatePDFThumbnails()
