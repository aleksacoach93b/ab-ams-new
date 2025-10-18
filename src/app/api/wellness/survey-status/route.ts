import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wellnessPlayerId = searchParams.get('wellnessPlayerId')
    const playerEmail = searchParams.get('playerEmail')

    if (!wellnessPlayerId) {
      return NextResponse.json({ error: 'Wellness player ID is required' }, { status: 400 })
    }

    // Fetch CSV data from wellness app
    const csvUrl = `https://wellness-monitor-tan.vercel.app/api/surveys/${wellnessPlayerId}/export/csv`
    console.log('Fetching wellness CSV from:', csvUrl)

    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,application/csv,*/*',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      console.error('Failed to fetch wellness CSV:', response.status, response.statusText)
      // Return a more graceful response instead of 500 error
      return NextResponse.json({
        completedToday: false,
        error: 'Wellness survey data temporarily unavailable',
        lastChecked: new Date().toISOString()
      })
    }

    const csvText = await response.text()
    console.log('CSV data length:', csvText.length)

    // Parse CSV data more carefully
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      console.log('No survey data found')
      return NextResponse.json({ completedToday: false })
    }

    // Find the submittedAt column (from the CSV structure you provided)
    const headers = lines[0].split(',')
    const dateColumnIndex = headers.findIndex(header => 
      header.includes('submittedAt')
    )

    if (dateColumnIndex === -1) {
      console.error('submittedAt column not found in CSV')
      return NextResponse.json({ completedToday: false })
    }

    // Get today's date in various formats
    const today = new Date()
    const todayFormats = [
      today.toLocaleDateString('en-US'), // MM/DD/YYYY
      today.toLocaleDateString('en-GB'), // DD/MM/YYYY
      today.toISOString().split('T')[0], // YYYY-MM-DD
    ]

    console.log('Today formats:', todayFormats)

    // Find the playerName column to check for specific player
    const playerNameColumnIndex = headers.findIndex(header => 
      header.includes('playerName')
    )

    console.log('Looking for player:', wellnessPlayerId)
    console.log('Date column index:', dateColumnIndex)
    console.log('Player name column index:', playerNameColumnIndex)

    // Check if any row has today's date AND matches the specific player
    let completedToday = false
    let playerFound = false
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const row = line.split(',')
      
      if (row[dateColumnIndex]) {
        const surveyDate = row[dateColumnIndex].trim().replace(/"/g, '')
        
        // Parse the date from format like "10/1/2025, 12:09:31 PM"
        const dateMatch = surveyDate.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
        if (dateMatch) {
          const extractedDate = dateMatch[1]
          
          // Check if this row is for today
          if (todayFormats.includes(extractedDate)) {
            console.log('Found survey for today:', extractedDate)
            
            // If we have player name column, check if it matches our player
            if (playerNameColumnIndex !== -1 && row[playerNameColumnIndex]) {
              const playerName = row[playerNameColumnIndex].trim().replace(/"/g, '')
              console.log('Player name in row:', playerName)
              console.log('Looking for player email:', playerEmail)
              
              // Check if this row matches our specific player
              // We can match by player name or email
              if (playerEmail && playerEmail.trim() !== '') {
                // Find the playerEmail column
                const playerEmailColumnIndex = headers.findIndex(header => 
                  header.includes('playerEmail')
                )
                
                if (playerEmailColumnIndex !== -1 && row[playerEmailColumnIndex]) {
                  const rowPlayerEmail = row[playerEmailColumnIndex].trim().replace(/"/g, '')
                  console.log('Player email in row:', rowPlayerEmail)
                  
                  if (rowPlayerEmail.toLowerCase() === playerEmail.toLowerCase()) {
                    playerFound = true
                    completedToday = true
                    console.log('Found survey completion for today by specific player:', playerName, rowPlayerEmail)
                    break
                  }
                }
              } else {
                // If no specific player email provided, check if any player completed today
                playerFound = true
                completedToday = true
                console.log('Found survey completion for today by player:', playerName)
                break
              }
            } else {
              // If no player name column, just check if any survey was completed today
              completedToday = true
              console.log('Found survey completion for today (no player name check)')
              break
            }
          }
        }
      }
    }

    console.log('Wellness survey completed today:', completedToday)

    return NextResponse.json({
      completedToday,
      lastChecked: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in wellness survey status API:', error)
    
    // Handle specific error types
    if (error?.name === 'AbortError') {
      console.log('Request timeout - wellness survey data unavailable')
      return NextResponse.json({
        completedToday: false,
        error: 'Request timeout - wellness survey data unavailable',
        lastChecked: new Date().toISOString()
      })
    }
    
    // For other errors, return a graceful response instead of 500
    return NextResponse.json({
      completedToday: false,
      error: 'Unable to check wellness survey status',
      lastChecked: new Date().toISOString()
    })
  }
}