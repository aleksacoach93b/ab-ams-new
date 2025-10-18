import { NextRequest } from 'next/server'

export interface FileAccessLogData {
  userId: string
  fileType: 'REPORT' | 'MEDIA' | 'AVATAR' | 'PLAYER_MEDIA' | 'EVENT_MEDIA'
  fileId?: string
  fileName?: string
  action: 'VIEW' | 'DOWNLOAD' | 'UPLOAD' | 'DELETE'
  ipAddress?: string
  userAgent?: string
}

export async function logFileAccess(logData: FileAccessLogData) {
  try {
    const response = await fetch('/api/admin/file-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    })

    if (!response.ok) {
      console.error('Failed to log file access:', await response.text())
    }
  } catch (error) {
    console.error('Error logging file access:', error)
  }
}

export function getClientInfo(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}
