'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, User, LogOut, Clock, MapPin, ArrowLeft, Folder, FileText, Image, File, Eye, Palette, Heart, ExternalLink, Activity } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import ReadOnlyCalendar from '@/components/ReadOnlyCalendar'

interface Event {
  id: string
  title: string
  description?: string
  type: string
  startTime: string
  endTime: string
  color: string
  icon?: string
}

interface MediaFile {
  id: string
  name: string // Database field name
  fileName?: string // For compatibility
  type: string // Database field name
  fileType?: string // For compatibility
  mimeType?: string
  size?: number
  fileSize?: number // For compatibility
  uploadedAt: string
  description?: string
  url: string
}

interface PlayerNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
  name: string
  }
}

export default function PlayerDashboard() {
  const router = useRouter()
  const { colorScheme, theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [playerNotes, setPlayerNotes] = useState<PlayerNote[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'dashboard' | 'media' | 'notes'>('dashboard')
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [wellnessCompletedToday, setWellnessCompletedToday] = useState<boolean | null>(null)
  const [isCheckingWellness, setIsCheckingWellness] = useState(false)

  // Redirect if not authenticated or not a player
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && user && user.role !== 'PLAYER') {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (user?.role === 'PLAYER') {
      fetchPlayerData()
    }
  }, [user])

  // Check wellness survey completion
  useEffect(() => {
    if (currentPlayer) {
      checkWellnessSurveyCompletion()
    }
  }, [currentPlayer])

  const fetchPlayerData = async () => {
    try {
      // Fetch events filtered by user participation
      const eventsResponse = await fetch(`/api/events?userId=${user?.id}&userRole=${user?.role}`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }

      // Fetch player's media files and notes
      // First get the player data to get the player ID
      const playerResponse = await fetch('/api/players')
      if (playerResponse.ok) {
        const playersData = await playerResponse.json()
        const foundPlayer = playersData.find((player: any) => 
          player.email === user?.email
        )
        
        console.log('Players data:', playersData)
        console.log('User email:', user?.email)
        console.log('Found player:', foundPlayer)
        
        if (foundPlayer) {
          setCurrentPlayer(foundPlayer)
          // Fetch player's media files
          const mediaResponse = await fetch(`/api/players/${foundPlayer.id}/media`)
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json()
            setMediaFiles(mediaData)
          }

          // Fetch player's notes
          const notesResponse = await fetch(`/api/players/${foundPlayer.id}/notes`)
          if (notesResponse.ok) {
            const notesData = await notesResponse.json()
            setPlayerNotes(notesData)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkWellnessSurveyCompletion = async () => {
    if (!currentPlayer) return
    
    setIsCheckingWellness(true)
    try {
      // Use the same wellness survey ID for all players
      // This ensures all players (existing and future) use the correct wellness survey
      const wellnessPlayerId = 'cmg6klyig0004l704u1kd78zb'
      
      console.log('Checking wellness survey completion for:', currentPlayer.name)
      console.log('Wellness Player ID:', wellnessPlayerId)
      
      // Use our internal API endpoint to avoid CORS issues
      const response = await fetch(`/api/wellness/survey-status?wellnessPlayerId=${wellnessPlayerId}&playerEmail=${encodeURIComponent(currentPlayer.email || '')}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Wellness survey status:', data)
        setWellnessCompletedToday(data.completedToday)
      } else {
        console.error('Failed to fetch wellness survey status:', response.status, response.statusText)
        // If API fails, assume not completed to allow access
        setWellnessCompletedToday(false)
      }
    } catch (error) {
      console.error('Error checking wellness survey completion:', error)
      // If there's an error, assume not completed to allow access
      setWellnessCompletedToday(false)
    } finally {
      setIsCheckingWellness(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2" style={{ color: colorScheme.textSecondary }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== 'PLAYER') {
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string | undefined | null, fileName?: string) => {
    // If fileType is available, use it
    if (fileType) {
      if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />
      if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />
      return <File className="h-5 w-5" />
    }
    
    // Fallback: use file extension from fileName
    if (fileName) {
      const extension = fileName.toLowerCase().split('.').pop()
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
        return <Image className="h-5 w-5" />
      }
      if (extension === 'pdf') {
        return <FileText className="h-5 w-5" />
      }
    }
    
    return <File className="h-5 w-5" />
  }

  const handleViewMedia = (file: MediaFile) => {
    setSelectedMedia(file)
    setShowMediaModal(true)
  }

  const renderMediaModal = () => {
    if (!selectedMedia || !showMediaModal) return null

    const fileName = selectedMedia.fileName || selectedMedia.name
    const fileType = selectedMedia.fileType || selectedMedia.mimeType
    
    const isImage = fileType?.startsWith('image/') || 
                   selectedMedia.type === 'IMAGE' ||
                   (fileName && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileName.toLowerCase().split('.').pop() || ''))

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="relative max-w-4xl max-h-[90vh] w-full" style={{ backgroundColor: colorScheme.surface }}>
      {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colorScheme.border }}>
            <h3 className="text-lg font-semibold" style={{ color: colorScheme.text }}>
              {fileName}
            </h3>
            <button
              onClick={() => setShowMediaModal(false)}
              className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
              style={{ backgroundColor: colorScheme.errorLight, color: colorScheme.error }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
            {isImage ? (
                  <div className="flex justify-center">
                    <img
                      src={selectedMedia.fileUrl || selectedMedia.url}
                      alt={fileName}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      style={{ maxWidth: '800px', maxHeight: '600px' }}
                    />
                  </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
                <p className="text-lg font-medium mb-2" style={{ color: colorScheme.text }}>
                  Preview not available
                </p>
                <p className="text-sm mb-4" style={{ color: colorScheme.textSecondary }}>
                  This file type cannot be previewed in the browser.
                </p>
                <a
                  href={selectedMedia.fileUrl || selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: colorScheme.primary, color: 'white' }}
                >
                  <Eye className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: colorScheme.border }}>
            <div className="text-sm" style={{ color: colorScheme.textSecondary }}>
              {(selectedMedia.fileSize || selectedMedia.size) && `${formatFileSize(selectedMedia.fileSize || selectedMedia.size || 0)} • `}
              {selectedMedia.uploadedAt && new Date(selectedMedia.uploadedAt).toLocaleDateString()}
            </div>
            {selectedMedia.description && (
              <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                {selectedMedia.description}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderMediaView = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setViewMode('dashboard')}
        className="flex items-center space-x-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: colorScheme.text }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
          </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colorScheme.text }}>
          📁 Your Media Files
        </h2>
        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
          {mediaFiles.length} files uploaded
        </p>
      </div>

      {/* Media Files Grid with Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaFiles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Folder className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colorScheme.text }}>
              No media files yet
            </h3>
            <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
              Media files uploaded by coaches will appear here
            </p>
          </div>
        ) : (
          mediaFiles.map((file) => {
            // Use correct field names from database
            const fileName = file.fileName || file.name
            const fileType = file.fileType || file.mimeType
            const fileSize = file.fileSize || file.size
            const fileUrl = file.fileUrl || file.url
            
            // Determine file type for preview
            const isImage = fileType?.startsWith('image/') || 
                           file.type === 'IMAGE' ||
                           (fileName && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileName.toLowerCase().split('.').pop() || ''))
            
            const isPDF = fileType?.includes('pdf') || 
                         file.type === 'DOCUMENT' ||
                         (fileName && fileName.toLowerCase().endsWith('.pdf'))
            
            return (
              <div
                key={file.id}
                className="group cursor-pointer"
                onClick={() => handleViewMedia(file)}
              >
                {/* File Preview Card */}
                <div
                  className="relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{ 
                backgroundColor: colorScheme.surface,
                borderColor: colorScheme.border
              }}
            >
                  {/* Preview Area */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-white">
                    {isImage ? (
                      <>
                        <img
                          src={fileUrl}
                          alt={fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Image failed to load:', fileUrl)
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', fileUrl)
                          }}
                        />
                        {/* Fallback for failed images */}
                        <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <Image className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs text-gray-600">Image Preview Failed</p>
                            <p className="text-xs text-gray-500 mt-1">{fileName}</p>
                          </div>
                  </div>
                      </>
                    ) : isPDF ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <div className="text-center">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-red-600" />
                          <p className="text-xs font-medium text-gray-800">PDF Document</p>
                          <p className="text-xs text-gray-600 mt-1">{fileName}</p>
              </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          {getFileIcon(fileType, fileName)}
                          <p className="text-xs font-medium mt-2 text-gray-800">
                            {fileType?.split('/')[1]?.toUpperCase() || file.type || 'File'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{fileName}</p>
                          </div>
                          </div>
                        )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Eye className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-sm truncate mb-1" style={{ color: colorScheme.text }}>
                      {fileName}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: colorScheme.textSecondary }}>
                      {fileSize ? formatFileSize(fileSize) : 'Unknown size'} • {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                    {file.description && (
                      <p className="text-xs truncate" style={{ color: colorScheme.textSecondary }}>
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderNotesView = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setViewMode('dashboard')}
        className="flex items-center space-x-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: colorScheme.text }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: colorScheme.text }}>
          📝 Your Notes
        </h2>
        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
          {playerNotes.length} notes from coaches
        </p>
            </div>

      {/* Notes List */}
      <div className="space-y-4">
        {playerNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colorScheme.text }}>
              No notes yet
            </h3>
            <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
              Notes from coaches will appear here
            </p>
          </div>
        ) : (
          playerNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: colorScheme.surface,
                borderColor: colorScheme.border
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium" style={{ color: colorScheme.text }}>
                  {note.title}
                        </h4>
                <span className="text-xs" style={{ color: colorScheme.textSecondary }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
              <div 
                className="text-sm mb-3 prose prose-sm max-w-none"
                    style={{ color: colorScheme.textSecondary }}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <p className="text-xs" style={{ color: colorScheme.textSecondary }}>
                By {note.author.name}
                  </p>
                </div>
          ))
              )}
            </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorScheme.background }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: colorScheme.surface }}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Player Avatar and Name */}
          <div className="flex items-center space-x-3">
            {currentPlayer?.imageUrl ? (
              <img
                src={currentPlayer.imageUrl}
                alt={currentPlayer?.name || 'Player'}
                className="w-10 h-10 rounded-full object-cover border-2"
                style={{ borderColor: colorScheme.border }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white border-2"
                style={{ 
                  backgroundColor: colorScheme.primary,
                  borderColor: colorScheme.border
                }}
              >
                {currentPlayer?.name ? currentPlayer.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
            )}
            <div>
              <p className="text-lg font-bold" style={{ color: colorScheme.text }}>
                {currentPlayer?.name || 'Player'}
              </p>
              <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                Player
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            
            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="px-2 py-1 rounded text-sm border transition-colors"
              style={{ 
                backgroundColor: colorScheme.surface,
                color: colorScheme.text,
                borderColor: colorScheme.border
              }}
              title="Change Theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
            
            <button
              onClick={logout}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ 
                backgroundColor: colorScheme.errorLight,
                color: colorScheme.error,
              }}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Render different views based on viewMode */}
        {viewMode === 'media' ? renderMediaView() : viewMode === 'notes' ? renderNotesView() : (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3" style={{ color: colorScheme.text }}>
                Welcome back, {currentPlayer?.name?.split(' ')[0] || 'Player'}! 👋
              </h2>
              <p className="text-base" style={{ color: colorScheme.textSecondary }}>
                {wellnessCompletedToday 
                  ? 'Your personal dashboard with media files and notes from coaches.'
                  : 'Please complete your daily wellness survey to access your full dashboard.'
                }
              </p>
            </div>

            {/* Wellness Survey Required Alert */}
            {wellnessCompletedToday === false && (
              <div 
                className="mb-6 p-6 rounded-2xl border-2"
                style={{ 
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-red-100">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-800 mb-1">
                      Daily Wellness Survey Required
              </h3>
                    <p className="text-red-700">
                      Complete your wellness survey to access your full dashboard and schedule.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wellness Survey Completed Success */}
            {wellnessCompletedToday === true && (
              <div 
                className="mb-6 p-6 rounded-2xl border-2"
                style={{ 
                  backgroundColor: '#F0FDF4',
                  borderColor: '#86EFAC'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-800 mb-1">
                      ✅ Wellness Survey Completed
                    </h3>
                    <p className="text-green-700">
                      Great! You've completed today's wellness survey. Enjoy your full dashboard access.
                    </p>
                  </div>
                </div>
              </div>
            )}
                
            {/* Modern Media, Notes, Wellness, and RPE Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Media Card */}
              <button
                onClick={() => setViewMode('media')}
                className="group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left"
                style={{ 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#DCFCE7' }}
                  >
                    <Folder className="h-8 w-8" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#059669' }}>
                      Media Files
                    </h3>
                    <p className="text-2xl font-bold mb-1" style={{ color: '#059669' }}>
                      {mediaFiles.length}
                    </p>
                    <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                      Files uploaded by coaches
                    </p>
                  </div>
                  <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </div>
                </div>
              </button>

              {/* Notes Card */}
              <button
                onClick={() => setViewMode('notes')}
                className="group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left"
                style={{ 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#EDE9FE' }}
                  >
                    <FileText className="h-8 w-8" style={{ color: '#7C3AED' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#7C3AED' }}>
                      Notes
                    </h3>
                    <p className="text-2xl font-bold mb-1" style={{ color: '#7C3AED' }}>
                      {playerNotes.length}
                    </p>
                    <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                      Messages from coaches
                    </p>
                  </div>
                  <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </div>
                </div>
              </button>

              {/* Wellness App Card */}
              <button
                onClick={async () => {
                  console.log('Wellness card clicked!')
                  console.log('Current player:', currentPlayer)
                  console.log('User email:', user?.email)
                  
                  if (!currentPlayer || !currentPlayer.id) {
                    console.log('No current player found')
                    alert('Player information not found. Please try again.')
                    return
                  }
                  
                  // Use the same wellness survey ID for all players
                  // This ensures all players (existing and future) use the correct wellness survey
                  const wellnessPlayerId = 'cmg6klyig0004l704u1kd78zb'
                  
                  // Always open the wellness survey when card is clicked
                  // (The wellness completion check is handled at the app level, not card level)
                  
                  const wellnessUrl = `https://wellness-monitor-tan.vercel.app/kiosk/${wellnessPlayerId}`
                  console.log('AB AMS Player ID:', currentPlayer.id)
                  console.log('Wellness Player ID:', wellnessPlayerId)
                  console.log('Opening wellness kiosk URL:', wellnessUrl)
                  
                  // Open wellness app in new tab
                  const wellnessWindow = window.open(wellnessUrl, '_blank')
                  
                  // Set up periodic checking for survey completion
                  const checkCompletion = setInterval(async () => {
                    if (wellnessWindow?.closed) {
                      clearInterval(checkCompletion)
                      console.log('Wellness app closed, checking for completion...')
                      // Re-check wellness survey completion
                      await checkWellnessSurveyCompletion()
                    }
                  }, 2000) // Check every 2 seconds
                  
                  // Clear interval after 10 minutes to avoid infinite checking
                  setTimeout(() => clearInterval(checkCompletion), 10 * 60 * 1000)
                }}
                className="group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left cursor-pointer"
                style={{ 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <Heart className="h-8 w-8" style={{ color: '#EF4444' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#EF4444' }}>
                      Wellness App
                    </h3>
                    {wellnessCompletedToday === true ? (
                      <>
                        <p className="text-sm font-medium mb-1" style={{ color: '#059669' }}>
                          ✅ Completed Today
                        </p>
                        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                          View your wellness data
                        </p>
                      </>
                    ) : wellnessCompletedToday === false ? (
                      <>
                        <p className="text-sm font-medium mb-1" style={{ color: '#EF4444' }}>
                          ⚠️ Required
                        </p>
                        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                          Complete daily survey
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1" style={{ color: '#EF4444' }}>
                          {isCheckingWellness ? 'Checking...' : 'Complete Survey'}
                        </p>
                        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                          Health & wellness tracking
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                    <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      →
                    </div>
                  </div>
              </div>
              </button>

              {/* RPE Survey Card */}
              <button
                onClick={async () => {
                  console.log('RPE card clicked!')
                  console.log('Current player:', currentPlayer)
                  
                  if (!currentPlayer || !currentPlayer.id) {
                    console.log('No current player found')
                    alert('Player information not found. Please try again.')
                    return
                  }
                  
                  // Use the same RPE survey ID for all players
                  // This ensures all players (existing and future) use the correct RPE survey
                  const rpePlayerId = 'cmg6z9rm30000ky04wzz9gym5'
                  
                  // For RPE survey, we'll directly open it without completion check for now
                  // You can add RPE completion check later if needed
                  
                  const rpeUrl = `https://wellness-monitor-tan.vercel.app/kiosk/${rpePlayerId}`
                  console.log('AB AMS Player ID:', currentPlayer.id)
                  console.log('RPE Player ID:', rpePlayerId)
                  console.log('Opening RPE kiosk URL:', rpeUrl)
                  
                  // Open RPE survey in new tab
                  window.open(rpeUrl, '_blank')
                }}
                className="group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left cursor-pointer"
                style={{ 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border
                }}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: '#FEF3C7' }}
                  >
                    <Activity className="h-8 w-8" style={{ color: '#D97706' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#D97706' }}>
                      RPE Survey
                    </h3>
                    <p className="text-sm font-medium mb-1" style={{ color: '#D97706' }}>
                      Rate Perceived Exertion
                    </p>
                    <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                      Training intensity tracking
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                    <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      →
                    </div>
                  </div>
                </div>
              </button>
              </div>

        {/* Modern Calendar Section - Always visible */}
        <div className="mb-6 w-full">
          <h3 className="text-2xl font-bold mb-6" style={{ color: colorScheme.text }}>
            📅 Your Schedule
          </h3>
          <div 
            className="w-full rounded-3xl shadow-xl p-4 border-2 transition-all duration-300 hover:shadow-2xl"
            style={{ 
              backgroundColor: colorScheme.surface,
              borderColor: colorScheme.border
            }}
          >
            <div className="w-full">
              <ReadOnlyCalendar userId={user?.id} userRole={user?.role} />
            </div>
          </div>
        </div>
          </>
        )}
      </main>
      
      {/* Media Modal */}
      {renderMediaModal()}
    </div>
  )
}