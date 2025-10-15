'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Upload, FileText, Image, Video, File, Trash2, Download, Eye, Search, Filter, Calendar, Grid, List, Plus, StickyNote, Edit, Pin } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import RichTextEditor from '@/components/RichTextEditor'

interface Player {
  id: string
  firstName: string
  lastName: string
  position: string
  dateOfBirth: string
  height: string
  weight: string
  status: string
  team: string
  avatar: string | null
  email: string
}

interface MediaFile {
  id: string
  name: string
  fileName?: string // For backward compatibility
  mimeType: string
  fileType?: string // For backward compatibility
  size: number
  fileSize?: number // For backward compatibility
  uploadedAt: string
  uploadDate?: string // For backward compatibility
  url: string
  thumbnail?: string
}

interface PlayerNote {
  id: string
  title?: string
  content: string
  isVisibleToPlayer: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export default function PlayerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { colorScheme, theme } = useTheme()
  const { user } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [notes, setNotes] = useState<PlayerNote[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'media' | 'notes'>('media')
  const [showNewNote, setShowNewNote] = useState(false)
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null)

  const playerId = params.id as string

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const [playerResponse, mediaResponse, notesResponse] = await Promise.all([
          fetch(`/api/players/${playerId}`),
          fetch(`/api/players/${playerId}/media`),
          fetch(`/api/players/${playerId}/notes`)
        ])

        if (playerResponse.ok) {
          const playerData = await playerResponse.json()
          setPlayer(playerData)
        }

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json()
          // Transform the data to match our interface
          const transformedMedia = mediaData.map((file: any) => ({
            id: file.id,
            name: file.name,
            fileName: file.name, // Use name as fileName for compatibility
            mimeType: file.mimeType,
            fileType: file.mimeType, // Use mimeType as fileType for compatibility
            size: file.size,
            fileSize: file.size, // Use size as fileSize for compatibility
            uploadedAt: file.uploadedAt,
            uploadDate: file.uploadedAt, // Use uploadedAt as uploadDate for compatibility
            url: file.url
          }))
          setMediaFiles(transformedMedia)
        }

        if (notesResponse.ok) {
          const notesData = await notesResponse.json()
          setNotes(notesData)
        }
      } catch (error) {
        console.error('Error fetching player data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (playerId) {
      fetchPlayerData()
    }
  }, [playerId])

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`/api/players/${playerId}/media`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newMedia = await response.json()
        // Transform the response to match our interface
        const transformedMedia = newMedia.map((file: any) => ({
          id: file.id,
          name: file.fileName || file.name,
          fileName: file.fileName || file.name,
          mimeType: file.fileType || file.mimeType,
          fileType: file.fileType || file.mimeType,
          size: file.fileSize || file.size,
          fileSize: file.fileSize || file.size,
          uploadedAt: file.uploadDate || file.uploadedAt,
          uploadDate: file.uploadDate || file.uploadedAt,
          url: file.url
        }))
        setMediaFiles(prev => [...prev, ...transformedMedia])
        setShowUploadModal(false)
      } else {
        alert('Failed to upload files')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      const response = await fetch(`/api/players/${playerId}/media/${mediaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMediaFiles(prev => prev.filter(file => file.id !== mediaId))
      } else {
        alert('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file')
    }
  }

  const getFileIcon = (file: MediaFile) => {
    const fileType = file.fileType || file.mimeType || ''
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6" />
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6" />
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  const formatFileSize = (file: MediaFile) => {
    const bytes = file.fileSize || file.size || 0
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredMedia = mediaFiles.filter(file => {
    const fileName = file.fileName || file.name || ''
    const matchesSearch = fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'All' || 
      (selectedFilter === 'Training' && fileName.toLowerCase().includes('training')) ||
      (selectedFilter === 'Match' && fileName.toLowerCase().includes('match')) ||
      (selectedFilter === 'Other' && !fileName.toLowerCase().includes('training') && !fileName.toLowerCase().includes('match'))
    return matchesSearch && matchesFilter
  })

  // Note handling functions
  const handleSaveNote = async (content: string, isVisible: boolean, isPinned: boolean) => {
    console.log('handleSaveNote called with:', { content, isVisible, isPinned, playerId, userId: user?.id })
    
    if (!user?.id) {
      alert('You must be logged in to save notes')
      return
    }
    
    try {
      // Extract text content for title (first 50 characters)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      const title = textContent.trim().substring(0, 50) || 'Untitled Note'
      
      const response = await fetch(`/api/players/${playerId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isVisibleToPlayer: isVisible,
          isPinned,
          authorId: user.id
        }),
      })

      console.log('Save note response:', response.status, response.statusText)

      if (response.ok) {
        const newNote = await response.json()
        console.log('Note saved successfully:', newNote)
        setNotes(prev => [newNote, ...prev])
        setShowNewNote(false)
        alert('Note saved successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to save note:', errorData)
        alert(`Failed to save note: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Error saving note')
    }
  }

  const handleUpdateNote = async (noteId: string, content: string, isVisible: boolean, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/players/${playerId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          isVisibleToPlayer: isVisible,
          isPinned
        }),
      })

      if (response.ok) {
        const updatedNote = await response.json()
        setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note))
        setEditingNote(null)
      } else {
        alert('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Error updating note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const response = await fetch(`/api/players/${playerId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
      } else {
        alert('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error deleting note')
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading player...
          </p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Player not found
          </p>
          <button
            onClick={() => router.back()}
            className="text-red-600 mt-2"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colorScheme.background }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 border-b px-4 py-3"
        style={{ 
          backgroundColor: colorScheme.surface,
          borderColor: colorScheme.border
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md transition-colors hover:opacity-70"
              style={{ color: colorScheme.textSecondary }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Player Avatar */}
            <div className="flex items-center space-x-3">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={`${player.firstName} ${player.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: colorScheme.border }}
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: colorScheme.background,
                    borderColor: colorScheme.border
                  }}
                >
                  <User className="h-5 w-5" style={{ color: colorScheme.textSecondary }} />
                </div>
              )}
              <h1 
                className="text-xl font-bold"
                style={{ color: colorScheme.text }}
              >
                {player.firstName} {player.lastName}
              </h1>
            </div>
          </div>
          
          {/* Edit Button */}
          <button
            onClick={() => router.push(`/dashboard/players/${playerId}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="border-b"
        style={{ borderColor: colorScheme.border }}
      >
        <div className="flex">
          <button
            onClick={() => setActiveTab('media')}
            className="px-6 py-3 text-sm font-medium border-b-2 transition-colors hover:opacity-70"
            style={{
              borderColor: activeTab === 'media' ? colorScheme.primary : 'transparent',
              color: activeTab === 'media' ? colorScheme.primary : colorScheme.textSecondary
            }}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Media</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className="px-6 py-3 text-sm font-medium border-b-2 transition-colors hover:opacity-70"
            style={{
              borderColor: activeTab === 'notes' ? colorScheme.primary : 'transparent',
              color: activeTab === 'notes' ? colorScheme.primary : colorScheme.textSecondary
            }}
          >
            <div className="flex items-center space-x-2">
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </div>
          </button>
        </div>
      </div>

      {/* Media Tab Content */}
      {activeTab === 'media' && (
        <>
          {/* Search and Filter Bar */}
          <div 
            className="p-4 border-b"
            style={{ 
              backgroundColor: colorScheme.surface,
              borderColor: colorScheme.border
            }}
          >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for event or media name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              style={{
                backgroundColor: colorScheme.surface,
                borderColor: colorScheme.border,
                color: colorScheme.text
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedFilter('Training')}
              className="px-3 py-1 text-sm rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: selectedFilter === 'Training' ? colorScheme.primary : colorScheme.border,
                color: selectedFilter === 'Training' ? 'white' : colorScheme.text
              }}
            >
              Training
            </button>
            <button
              onClick={() => setSelectedFilter('Match')}
              className="px-3 py-1 text-sm rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: selectedFilter === 'Match' ? colorScheme.primary : colorScheme.border,
                color: selectedFilter === 'Match' ? 'white' : colorScheme.text
              }}
            >
              Match
            </button>
            <button
              onClick={() => setSelectedFilter('Other')}
              className="px-3 py-1 text-sm rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: selectedFilter === 'Other' ? colorScheme.primary : colorScheme.border,
                color: selectedFilter === 'Other' ? 'white' : colorScheme.text
              }}
            >
              Other
            </button>
          </div>

          {/* View Mode and Upload */}
          <div className="flex items-center space-x-2">
            <div 
              className="flex items-center border rounded-md"
              style={{ borderColor: colorScheme.border }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? colorScheme.primary : 'transparent',
                  color: viewMode === 'grid' ? 'white' : colorScheme.textSecondary
                }}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? colorScheme.primary : 'transparent',
                  color: viewMode === 'list' ? 'white' : colorScheme.textSecondary
                }}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="p-4">
        {filteredMedia.length === 0 ? (
          <div 
            className="text-center py-12 rounded-lg border"
            style={{ 
              backgroundColor: colorScheme.surface,
              borderColor: colorScheme.border
            }}
          >
            <Upload 
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: colorScheme.textSecondary }}
            />
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: colorScheme.text }}
            >
              No media files found
            </h3>
            <p style={{ color: colorScheme.textSecondary }}>
              {searchTerm || selectedFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first media file to get started'
              }
            </p>
            {!searchTerm && selectedFilter === 'All' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-3'
          }>
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                className={`group relative ${
                  viewMode === 'grid' 
                    ? 'rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow'
                    : 'flex items-center p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow'
                }`}
                style={{ 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border
                }}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div 
                      className="aspect-square flex items-center justify-center"
                      style={{ backgroundColor: colorScheme.background }}
                    >
                      {(file.fileType || file.mimeType || '').startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.fileName || file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="text-center"
                          style={{ color: colorScheme.textSecondary }}
                        >
                          {getFileIcon(file)}
                          <p className="text-xs mt-2 truncate px-2">{file.fileName || file.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 
                        className="text-sm font-medium truncate"
                        style={{ color: colorScheme.text }}
                      >
                        {file.fileName || file.name}
                      </h4>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: colorScheme.textSecondary }}
                      >
                        {formatFileSize(file)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div 
                      className="flex-shrink-0 mr-3"
                      style={{ color: colorScheme.textSecondary }}
                    >
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-sm font-medium truncate"
                        style={{ color: colorScheme.text }}
                      >
                        {file.fileName || file.name}
                      </h4>
                      <p 
                        className="text-xs"
                        style={{ color: colorScheme.textSecondary }}
                      >
                        {formatFileSize(file)} • {new Date(file.uploadDate || file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className={`absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  viewMode === 'list' ? 'relative top-0 right-0 opacity-100' : ''
                }`}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md transition-colors shadow-sm hover:opacity-80"
                    style={{
                      backgroundColor: colorScheme.border,
                      color: colorScheme.textSecondary
                    }}
                    title="View"
                  >
                    <Eye className="h-3 w-3" />
                  </a>
                  <a
                    href={file.url}
                    download={file.fileName || file.name}
                    className="p-1.5 rounded-md transition-colors shadow-sm hover:opacity-80"
                    style={{
                      backgroundColor: colorScheme.border,
                      color: colorScheme.textSecondary
                    }}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteMedia(file.id)}
                    className="p-1.5 rounded-md transition-colors shadow-sm hover:opacity-80"
                    style={{
                      backgroundColor: colorScheme.border,
                      color: colorScheme.textSecondary
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Notes Tab Content */}
      {activeTab === 'notes' && (
        <div className="p-4">
          {/* Add Note Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewNote(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </button>
          </div>

          {/* New Note Editor */}
          {showNewNote && (
            <div className="mb-6">
              <RichTextEditor
                onSave={(content) => {
                  console.log('RichTextEditor onSave called with:', content)
                  handleSaveNote(content, true, false)
                }}
                onCancel={() => setShowNewNote(false)}
                placeholder="Enter a note about this player..."
              />
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 ? (
            <div 
              className="text-center py-12 rounded-lg border"
              style={{ 
                backgroundColor: colorScheme.surface,
                borderColor: colorScheme.border
              }}
            >
              <StickyNote 
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: colorScheme.textSecondary }}
              />
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: colorScheme.text }}
              >
                No notes yet
              </h3>
              <p style={{ color: colorScheme.textSecondary }}>
                Add your first note about this player
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border"
                  style={{ 
                    backgroundColor: colorScheme.surface,
                    borderColor: colorScheme.border
                  }}
                >
                  {/* Note Header */}
                  <div 
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: colorScheme.border }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {note.author.avatar ? (
                          <img
                            src={note.author.avatar}
                            alt={`${note.author.firstName} ${note.author.lastName}`}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                        )}
                        <span 
                          className="text-sm font-medium"
                          style={{ color: colorScheme.text }}
                        >
                          {note.author.firstName} {note.author.lastName}
                        </span>
                      </div>
                      <span 
                        className="text-xs"
                        style={{ color: colorScheme.textSecondary }}
                      >
                        {new Date(note.createdAt).toLocaleDateString()} 
                        {note.updatedAt !== note.createdAt && ' (edited)'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {note.isPinned && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Pin className="h-3 w-3 mr-1" />
                          PINNED
                        </span>
                      )}
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 rounded transition-colors hover:opacity-70"
                        style={{ color: colorScheme.textSecondary }}
                        title="Edit Note"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded transition-colors hover:opacity-70"
                        style={{ color: colorScheme.textSecondary }}
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="p-4">
                    {editingNote && editingNote.id === note.id ? (
                      <RichTextEditor
                        initialContent={note.content}
                        onSave={(content) => handleUpdateNote(note.id, content, note.isVisibleToPlayer, note.isPinned)}
                        onCancel={() => setEditingNote(null)}
                        isVisible={note.isVisibleToPlayer}
                        isPinned={note.isPinned}
                        onToggleVisible={(visible) => {
                          const updatedNote = { ...note, isVisibleToPlayer: visible }
                          setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n))
                        }}
                        onTogglePinned={(pinned) => {
                          const updatedNote = { ...note, isPinned: pinned }
                          setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n))
                        }}
                        isEditing={true}
                      />
                    ) : (
                      <div 
                        className={`prose prose-sm max-w-none ${
                          theme === 'dark' ? 'prose-invert' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Upload Media Files
              </h3>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Upload PDFs, images, videos, and other files
              </p>
            </div>
            <div className="p-6">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={uploading}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={uploading}
                >
                  Cancel
                </button>
              </div>
              {uploading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  <p className={`text-sm mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Uploading files...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}