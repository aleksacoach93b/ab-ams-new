'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Calendar, Clock, MapPin, Users, Edit, Trash2, X, Save, User, UserCheck, Upload, Image, Video, File, Download, Eye } from 'lucide-react'
import CustomIcon from './CustomIcon'
import EventIconSelector from './EventIconSelector'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface Event {
  id: string
  title: string
  description?: string
  type: string
  date: string
  startTime: string
  endTime: string
  location?: string
  color: string
  icon?: string
  selectedPlayers?: string[]
  selectedStaff?: string[]
}

interface Player {
  id: string
  firstName: string
  lastName: string
  position?: string
  jerseyNumber?: number
}

interface Coach {
  id: string
  firstName: string
  lastName: string
  coachType?: string
  position?: string
  department?: string
}

interface EventMedia {
  id: string
  fileName: string
  fileType: string
  fileUrl: string
  fileSize?: number
  uploadedAt: string
}

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onEdit: (updatedEvent: Event) => void
  onDelete: (eventId: string) => void
  user?: {
    role?: string
    id?: string
  } | null
  staffPermissions?: {
    canCreateEvents?: boolean
    canEditEvents?: boolean
    canDeleteEvents?: boolean
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'TRAINING': return '#F59E0B' // Orange
    case 'MATCH': return '#EF4444' // Red
    case 'MEETING': return '#3B82F6' // Blue
    case 'MEDICAL': return '#10B981' // Green
    case 'RECOVERY': return '#8B5CF6' // Purple
    case 'MEAL': return '#F97316' // Orange-Red (distinct from training)
    case 'REST': return '#6366F1' // Indigo
    case 'OTHER': return '#6B7280' // Gray
    default: return '#6B7280' // Gray
  }
}

const getEventIconComponent = (iconName: string, color?: string) => {
  return <CustomIcon name={iconName} className="h-5 w-5" style={{ color }} />
}

export default function EventModal({ event, isOpen, onClose, onEdit, onDelete, user, staffPermissions }: EventModalProps) {
  const { colorScheme, theme } = useTheme()
  const { token } = useAuth()
  
  // Permission checking functions
  const canEditEvents = () => {
    if (user?.role === 'ADMIN' || user?.role === 'COACH') {
      return true
    }
    if (user?.role === 'STAFF' && staffPermissions?.canEditEvents) {
      return true
    }
    return false
  }

  const canDeleteEvents = () => {
    if (user?.role === 'ADMIN' || user?.role === 'COACH') {
      return true
    }
    if (user?.role === 'STAFF' && staffPermissions?.canDeleteEvents) {
      return true
    }
    return false
  }

  const canManageMedia = () => {
    if (user?.role === 'ADMIN' || user?.role === 'COACH') {
      return true
    }
    if (user?.role === 'STAFF' && staffPermissions?.canEditEvents) {
      return true
    }
    return false
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<EventMedia[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<EventMedia | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSelectingFile, setIsSelectingFile] = useState(false)



  useEffect(() => {
    if (event) {
      setFormData(event)
      setSelectedPlayers(event.selectedPlayers || [])
      setSelectedStaff(event.selectedStaff || [])
    }
  }, [event])


  // Fetch players, staff, and media when modal opens
  useEffect(() => {
    if (isOpen && event) {
      const fetchData = async () => {
        try {
          const [playersResponse, staffResponse, mediaResponse] = await Promise.all([
            fetch('/api/players'),
            fetch('/api/staff'),
            fetch(`/api/events/${event.id}/media`)
          ])

          if (playersResponse.ok) {
            const playersData = await playersResponse.json()
            setPlayers(playersData)
          }

          if (staffResponse.ok) {
            const staffData = await staffResponse.json()
            setCoaches(staffData)
          }

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json()
            console.log('📁 Fetched event media data:', mediaData)
            console.log('📁 Event media count:', mediaData.length)
            setMediaFiles(mediaData)
          } else {
            console.error('❌ Failed to fetch event media:', mediaResponse.status)
          }

        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }

      fetchData()
    }
  }, [isOpen, event])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } : null)
  }

  const handleIconSelect = (icon: string) => {
    setFormData(prev => prev ? { ...prev, icon } : null)
  }

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    )
  }

  const handleSelectAllPlayers = () => {
    const allPlayerIds = players.map(player => player.id)
    setSelectedPlayers(prev => 
      prev.length === allPlayerIds.length ? [] : allPlayerIds
    )
  }

  const handleSelectAllStaff = () => {
    const allStaffIds = coaches.map(staff => staff.id)
    setSelectedStaff(prev => 
      prev.length === allStaffIds.length ? [] : allStaffIds
    )
  }

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
    setIsSelectingFile(false)
  }

  const handleFileInputClick = () => {
    setIsSelectingFile(true)
    // Reset the flag after a timeout in case file dialog doesn't trigger onChange
    setTimeout(() => {
      setIsSelectingFile(false)
    }, 3000)
  }

  const handleConfirmUpload = async () => {
    if (selectedFile && event) {
      await handleMediaUpload()
    }
  }

  const handleMediaUpload = async () => {
    console.log('🚀 Upload button clicked!')
    console.log('📁 Selected file:', selectedFile)
    console.log('📅 Event:', event)
    
    if (!selectedFile || !event) {
      alert('Please select a file first!')
      return
    }

    console.log('🚀 Starting upload for event:', event.id, 'File:', selectedFile.name)
    
    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔑 Using auth token')
      } else {
        console.log('❌ No auth token available')
      }

      console.log('📤 Sending upload request to:', `/api/events/${event.id}/media`)
      console.log('📤 File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      })

      const response = await fetch(`/api/events/${event.id}/media`, {
        method: 'POST',
        headers,
        body: formData,
      })

      console.log('📥 Upload response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Media upload result:', result)
        console.log('✅ Media object:', result.media)
        
        // Add the new media to the list
        setMediaFiles(prev => [result.media, ...prev])
        
        // Close modal and reset
        setSelectedFile(null)
        setShowMediaUpload(false)
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
        
        console.log('✅ Upload completed successfully')
      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
        alert(`Failed to upload media: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Error uploading media:', error)
      alert(`Error uploading media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!event || !confirm('Are you sure you want to delete this media file?')) return

    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/events/${event.id}/media/${mediaId}`, {
        method: 'DELETE',
        headers,
      })

      if (response.ok) {
        setMediaFiles(prev => prev.filter(media => media.id !== mediaId))
        console.log('✅ Media deleted successfully')
      } else {
        const error = await response.json()
        console.error('❌ Media deletion failed:', error)
        alert(error.message || 'Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Error deleting media')
    }
  }

  const getFileIcon = (media: EventMedia) => {
    const mimeType = media.fileType
    
    if (mimeType?.startsWith('image/')) return <Image className="h-8 w-8" />
    if (mimeType?.startsWith('video/')) return <Video className="h-8 w-8" />
    if (mimeType?.startsWith('audio/')) return <File className="h-8 w-8" />
    if (mimeType === 'application/pdf') return <File className="h-8 w-8" style={{ color: '#dc2626' }} />
    if (mimeType?.includes('document') || mimeType?.includes('word')) return <File className="h-8 w-8" style={{ color: '#2563eb' }} />
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return <File className="h-8 w-8" style={{ color: '#059669' }} />
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <File className="h-8 w-8" style={{ color: '#dc2626' }} />
    
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSave = async () => {
    if (!formData) {
      console.error('No form data available')
      alert('No event data to save.')
      return
    }

    console.log('💾 Saving event with data:', formData)
    setIsLoading(true)
    
    try {
      const eventData = {
        ...formData,
        selectedPlayers,
        selectedStaff
      }

      console.log('💾 Sending event data to API:', eventData)

      if (!event) {
        console.error('❌ No event to update')
        return
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      console.log('💾 API Response status:', response.status)

      if (response.ok) {
        const updatedEvent = await response.json()
        console.log('✅ Event updated successfully:', updatedEvent)
        onEdit(updatedEvent.event)
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to update event:', errorData)
        alert(`Failed to update event: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Error updating event:', error)
      alert('An error occurred while updating the event.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(event.id)
      } else {
        console.error('Failed to delete event')
        alert('Failed to delete event.')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('An error occurred while deleting the event.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start sm:items-center justify-center p-1 sm:p-4 text-center pt-2 sm:pt-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[98vh] sm:max-h-[90vh] transform overflow-y-auto rounded-2xl p-2 sm:p-6 text-left align-middle shadow-xl transition-all"
                style={{ backgroundColor: colorScheme.surface }}
              >
                <div className="flex justify-between items-center mb-2 sm:mb-6">
                  <Dialog.Title 
                    as="h3" 
                    className="text-lg sm:text-xl font-semibold leading-6"
                    style={{ color: colorScheme.text }}
                  >
                    {isEditing ? 'Edit Event' : 'Event Details'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="transition-colors hover:opacity-70"
                    style={{ color: colorScheme.textSecondary }}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {isEditing && canEditEvents() ? (
                  <div className="overflow-y-auto max-h-[85vh] sm:max-h-[70vh] pr-1 sm:pr-2 scroll-smooth">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6">
                      {/* Left Column */}
                      <div className="space-y-2 sm:space-y-6">
                        {/* Basic Information */}
                        <div 
                          className="rounded-lg p-2 sm:p-4"
                          style={{ backgroundColor: colorScheme.background }}
                        >
                          <h4 
                            className="text-lg font-medium mb-4"
                            style={{ color: colorScheme.text }}
                          >
                            Basic Information
                          </h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Event Title *
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={formData?.title || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                                placeholder="Enter event title"
                              />
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Description
                              </label>
                              <textarea
                                name="description"
                                value={formData?.description || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                                placeholder="Enter event description"
                              />
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Event Type
                              </label>
                              <select
                                name="type"
                                value={formData?.type || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                              >
                                <option value="TRAINING">Training</option>
                                <option value="MATCH">Match</option>
                                <option value="MEETING">Meeting</option>
                                <option value="MEDICAL">Medical</option>
                                <option value="RECOVERY">Recovery</option>
                                <option value="MEAL">Meal</option>
                                <option value="REST">Rest</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Event Icon
                              </label>
                              <EventIconSelector 
                                selectedIcon={formData?.icon || 'Calendar'}
                                onIconSelect={handleIconSelect}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div 
                          className="rounded-lg p-2 sm:p-4"
                          style={{ backgroundColor: colorScheme.background }}
                        >
                          <h4 
                            className="text-lg font-medium mb-4"
                            style={{ color: colorScheme.text }}
                          >
                            Date & Time
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Date *
                              </label>
                              <input
                                type="date"
                                name="date"
                                value={formData?.date || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                              />
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Location
                              </label>
                              <input
                                type="text"
                                name="location"
                                value={formData?.location || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                                placeholder="Enter location"
                              />
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                Start Time *
                              </label>
                              <input
                                type="time"
                                name="startTime"
                                value={formData?.startTime || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                              />
                            </div>

                            <div>
                              <label 
                                className="block text-sm font-medium mb-2"
                                style={{ color: colorScheme.text }}
                              >
                                End Time *
                              </label>
                              <input
                                type="time"
                                name="endTime"
                                value={formData?.endTime || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{
                                  backgroundColor: colorScheme.surface,
                                  borderColor: colorScheme.border,
                                  color: colorScheme.text
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-2 sm:space-y-6">
                        {/* Players Selection */}
                        <div 
                          className="rounded-lg p-2 sm:p-4"
                          style={{ backgroundColor: colorScheme.background }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 
                              className="text-lg font-medium"
                              style={{ color: colorScheme.text }}
                            >
                              Players ({selectedPlayers.length} selected)
                            </h4>
                            <button
                              type="button"
                              onClick={handleSelectAllPlayers}
                              className="text-xs font-medium transition-colors"
                              style={{ color: colorScheme.primary }}
                            >
                              {selectedPlayers.length === players.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {players.map((player) => (
                              <label
                                key={player.id}
                                className="flex items-center space-x-3 p-2 rounded-md hover:opacity-80 cursor-pointer"
                                style={{ backgroundColor: colorScheme.surface }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPlayers.includes(player.id)}
                                  onChange={() => handlePlayerToggle(player.id)}
                                  className="form-checkbox h-4 w-4 text-red-600"
                                />
                                <div className="flex-1">
                                  <p 
                                    className="text-sm font-medium"
                                    style={{ color: colorScheme.text }}
                                  >
                                    {player.firstName} {player.lastName}
                                  </p>
                                  <p 
                                    className="text-xs"
                                    style={{ color: colorScheme.textSecondary }}
                                  >
                                    {player.position || 'No position'} • {player.jerseyNumber ? `#${player.jerseyNumber}` : 'No number'}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Staff Selection */}
                        <div 
                          className="rounded-lg p-2 sm:p-4"
                          style={{ backgroundColor: colorScheme.background }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 
                              className="text-lg font-medium"
                              style={{ color: colorScheme.text }}
                            >
                              Staff ({selectedStaff.length} selected)
                            </h4>
                            <button
                              type="button"
                              onClick={handleSelectAllStaff}
                              className="text-xs font-medium transition-colors"
                              style={{ color: colorScheme.primary }}
                            >
                              {selectedStaff.length === coaches.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {coaches.map((coach) => (
                              <label
                                key={coach.id}
                                className="flex items-center space-x-3 p-2 rounded-md hover:opacity-80 cursor-pointer"
                                style={{ backgroundColor: colorScheme.surface }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStaff.includes(coach.id)}
                                  onChange={() => handleStaffToggle(coach.id)}
                                  className="form-checkbox h-4 w-4 text-red-600"
                                />
                                <div className="flex-1">
                                  <p 
                                    className="text-sm font-medium"
                                    style={{ color: colorScheme.text }}
                                  >
                                    {coach.firstName} {coach.lastName}
                                  </p>
                                  <p 
                                    className="text-xs"
                                    style={{ color: colorScheme.textSecondary }}
                                  >
                                    {coach.position || 'Staff Member'} • {coach.department || 'General'}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-6 border-t" style={{ borderColor: colorScheme.border }}>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 sm:px-6 py-2 text-sm font-medium rounded-md transition-colors"
                        style={{
                          backgroundColor: colorScheme.border,
                          color: colorScheme.text
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Event Header */}
                    <div className="flex items-center space-x-4">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: event.color + '20' }}
                      >
                        <div style={{ color: event.color }}>
                          {getEventIconComponent(event.icon || 'Calendar', event.color)}
                        </div>
                      </div>
                      <div>
                        <h4 
                          className="text-xl font-semibold"
                          style={{ color: colorScheme.text }}
                        >
                          {event.title}
                        </h4>
                        <p 
                          className="text-sm"
                          style={{ color: colorScheme.textSecondary }}
                        >
                          {event.type}
                        </p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div 
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colorScheme.background }}
                      >
                        <h5 
                          className="font-medium mb-3"
                          style={{ color: colorScheme.text }}
                        >
                          Event Information
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Calendar 
                              className="h-4 w-4" 
                              style={{ color: colorScheme.textSecondary }}
                            />
                            <span 
                              className="text-sm"
                              style={{ color: colorScheme.text }}
                            >
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Clock 
                              className="h-4 w-4" 
                              style={{ color: colorScheme.textSecondary }}
                            />
                            <span 
                              className="text-sm"
                              style={{ color: colorScheme.text }}
                            >
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center space-x-3">
                              <MapPin 
                                className="h-4 w-4" 
                                style={{ color: colorScheme.textSecondary }}
                              />
                              <span 
                                className="text-sm"
                                style={{ color: colorScheme.text }}
                              >
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Participants */}
                      <div 
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colorScheme.background }}
                      >
                        <h5 
                          className="font-medium mb-3"
                          style={{ color: colorScheme.text }}
                        >
                          Participants
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Users 
                              className="h-4 w-4" 
                              style={{ color: colorScheme.textSecondary }}
                            />
                            <span 
                              className="text-sm"
                              style={{ color: colorScheme.text }}
                            >
                              {event.selectedPlayers?.length || 0} players selected
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <UserCheck 
                              className="h-4 w-4" 
                              style={{ color: colorScheme.textSecondary }}
                            />
                            <span 
                              className="text-sm"
                              style={{ color: colorScheme.text }}
                            >
                              {event.selectedStaff?.length || 0} staff selected
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div 
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colorScheme.background }}
                      >
                        <h5 
                          className="font-medium mb-3"
                          style={{ color: colorScheme.text }}
                        >
                          Description
                        </h5>
                        <p 
                          className="text-sm"
                          style={{ color: colorScheme.text }}
                        >
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* Media Files */}
                    <div 
                      className="rounded-lg p-4"
                      style={{ backgroundColor: colorScheme.background }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 
                          className="font-medium"
                          style={{ color: colorScheme.text }}
                        >
                          Media Files ({mediaFiles.length})
                        </h5>
                        {canManageMedia() && (
                          <button
                            onClick={() => setShowMediaUpload(true)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Media
                          </button>
                        )}
                      </div>
                      
                      {mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {mediaFiles.map((media) => (
                            <div
                              key={media.id}
                              className="group relative rounded-lg border overflow-hidden"
                              style={{ 
                                backgroundColor: colorScheme.surface,
                                borderColor: colorScheme.border
                              }}
                            >
                              <div className="aspect-square flex items-center justify-center p-2">
                                {media.fileType?.startsWith('image/') ? (
                                  <img
                                    src={media.fileUrl}
                                    alt={media.fileName}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      console.error('Image load error:', e)
                                      // Fallback to file icon if image fails to load
                                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                                      ;(e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'block')
                                    }}
                                  />
                                ) : media.fileType?.startsWith('video/') ? (
                                  <video
                                    src={media.fileUrl}
                                    className="w-full h-full object-cover rounded"
                                    controls
                                    preload="metadata"
                                  />
                                ) : null}
                                
                                {/* Fallback for non-media files or failed image loads */}
                                <div 
                                  className="text-center w-full h-full flex flex-col items-center justify-center"
                                  style={{ 
                                    color: colorScheme.textSecondary,
                                    display: media.fileType?.startsWith('image/') ? 'none' : 'flex'
                                  }}
                                >
                                  {getFileIcon(media)}
                                  <p className="text-xs mt-1 truncate px-1 max-w-full">{media.fileName}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {media.fileSize ? `${Math.round(media.fileSize / 1024)}KB` : ''}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setPreviewMedia(media)}
                                  className="p-1 rounded transition-colors"
                                  style={{
                                    backgroundColor: colorScheme.border,
                                    color: colorScheme.textSecondary
                                  }}
                                  title="Preview"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <a
                                  href={media.fileUrl}
                                  download={media.fileName}
                                  className="p-1 rounded transition-colors"
                                  style={{
                                    backgroundColor: colorScheme.border,
                                    color: colorScheme.textSecondary
                                  }}
                                  title="Download"
                                >
                                  <Download className="h-3 w-3" />
                                </a>
                                {canManageMedia() && (
                                  <button
                                    onClick={() => handleDeleteMedia(media.id)}
                                    className="p-1 rounded transition-colors"
                                    style={{
                                      backgroundColor: colorScheme.border,
                                      color: colorScheme.textSecondary
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="text-center py-8 rounded-lg border"
                          style={{ 
                            backgroundColor: colorScheme.surface,
                            borderColor: colorScheme.border
                          }}
                        >
                          <Upload 
                            className="h-12 w-12 mx-auto mb-3"
                            style={{ color: colorScheme.textSecondary }}
                          />
                          <p 
                            className="text-sm mb-3"
                            style={{ color: colorScheme.textSecondary }}
                          >
                            No media files uploaded yet
                          </p>
                          {canManageMedia() && (
                            <button
                              onClick={() => setShowMediaUpload(true)}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload Media
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(canEditEvents() || canDeleteEvents()) && (
                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t" style={{ borderColor: colorScheme.border }}>
                        {canDeleteEvents() && (
                          <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            Delete
                          </button>
                        )}
                        {canEditEvents() && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Edit className="h-4 w-4 inline mr-1" />
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Media Upload Modal */}
        {showMediaUpload && canManageMedia() && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              // Only close if clicking the backdrop and not during file selection
              if (e.target === e.currentTarget && !uploadingMedia && !isSelectingFile) {
                setShowMediaUpload(false)
                setSelectedFile(null)
              }
            }}
          >
            <div 
              className="w-full max-w-md rounded-lg"
              style={{ backgroundColor: colorScheme.surface }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Upload Media
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
                onChange={handleFileSelection}
                onClick={handleFileInputClick}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav"
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={uploadingMedia}
              />
              {selectedFile && (
                <div className="mt-2">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selected 1 file(s):
                  </p>
                  <ul className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    <li className="truncate">• {selectedFile.name}</li>
                  </ul>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                <button
                  onClick={() => {
                    if (!uploadingMedia) {
                      setShowMediaUpload(false)
                      setSelectedFile(null)
                      setIsSelectingFile(false)
                    }
                  }}
                  disabled={uploadingMedia}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingMedia || !selectedFile}
                >
                  {uploadingMedia ? 'Uploading...' : 'Add'}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {previewMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-70">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto"
              style={{ backgroundColor: colorScheme.surface }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 
                  className="text-lg font-medium"
                  style={{ color: colorScheme.text }}
                >
                  {previewMedia.fileName}
                </h3>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-2 rounded-md transition-colors"
                  style={{ 
                    backgroundColor: colorScheme.border,
                    color: colorScheme.textSecondary
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                {previewMedia.fileType?.startsWith('image/') ? (
                  <img
                    src={previewMedia.fileUrl}
                    alt={previewMedia.fileName}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Preview image load error:', e)
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      ;(e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'block')
                    }}
                  />
                ) : previewMedia.fileType?.startsWith('video/') ? (
                  <video
                    src={previewMedia.fileUrl}
                    controls
                    className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : previewMedia.fileType?.startsWith('audio/') ? (
                  <audio
                    src={previewMedia.fileUrl}
                    controls
                    className="w-full max-w-md"
                  >
                    Your browser does not support the audio tag.
                  </audio>
                ) : null}
                
                {/* Fallback for unsupported preview types */}
                <div 
                  className="text-center p-8 max-w-md"
                  style={{
                    color: colorScheme.textSecondary,
                    display: previewMedia.fileType?.startsWith('image/') ? 'none' : 'block'
                  }}
                >
                  <div className="mb-4">
                    {getFileIcon(previewMedia)}
                  </div>
                  <p className="text-lg font-medium mb-2" style={{ color: colorScheme.text }}>
                    {previewMedia.fileName}
                  </p>
                  <p className="text-sm mb-4">
                    {previewMedia.fileSize ? `${Math.round(previewMedia.fileSize / 1024)}KB` : 'Unknown size'}
                  </p>
                  <p className="text-sm mb-4">
                    This file type cannot be previewed in the browser.
                  </p>
                  <a
                    href={previewMedia.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  )
}