import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wellnessPlayerId = searchParams.get('wellnessPlayerId')
    
    if (!wellnessPlayerId) {
      return NextResponse.json({ error: 'Wellness player ID is required' }, { status: 400 })
    }
    
    // Fetch CSV data from wellness app
    const csvUrl = `https://wellness-monitor-tan.vercel.app/api/surveys/${wellnessPlayerId}/export/csv`
    console.log('Fetching wellness CSV from:', csvUrl)
    
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'AB-AMS-App/1.0',
      },
    })
    
    if (!response.ok) {
      console.error('Failed to fetch wellness CSV:', response.status, response.statusText)
      return NextResponse.json({ 
        error: 'Failed to fetch wellness survey data',
        status: response.status 
      }, { status: response.status })
    }
    
    const csvText = await response.text()
    console.log('CSV data length:', csvText.length)
    
    // Parse CSV to check for today's completion
    const lines = csvText.split('\n')
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    // Get today's date in multiple formats
    const today = new Date()
    const todayFormats = [
      `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`, // M/D/YYYY
      `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`, // MM/DD/YYYY
      `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`, // D/M/YYYY
      `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`, // DD/MM/YYYY
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`, // YYYY-MM-DD
    ]
    
    console.log('Today formats:', todayFormats)
    
    // Check if any survey was completed today
    const completedToday = dataLines.some(line => {
      if (!line.trim()) return false
      
      try {
        // Parse the line to get the date
        const columns = line.split(',')
        if (columns.length < 3) return false
        
        // The submittedAt column is the 3rd column (index 2)
        const submittedAt = columns[2]
        
        // Extract just the date part from "10/15/2025, 9:32:32 AM" format
        const surveyDate = submittedAt.split(',')[0].replace(/"/g, '').trim()
        console.log('Survey date:', surveyDate)
        
        // Check if the date matches any of today's formats
        const isToday = todayFormats.some(format => surveyDate === format)
        if (isToday) {
          console.log('Found match! Survey completed today:', surveyDate)
        }
        
        return isToday
      } catch (error) {
        console.error('Error parsing survey line:', error, line)
        return false
      }
    })
    
    console.log('Wellness survey completed today:', completedToday)
    
    return NextResponse.json({ 
      completedToday,
      totalSurveys: dataLines.length,
      lastChecked: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in wellness survey status API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
