'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Calendar, Clock, MapPin, Users, Edit, Trash2, X, Save, User, UserCheck, Upload, Image, Video, File, Download, Eye } from 'lucide-react'
import CustomIcon from './CustomIcon'
import EventIconSelector from './EventIconSelector'
import { useTheme } from '@/contexts/ThemeContext'

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
}

interface EventMedia {
  id: string
  name: string
  type: string
  url: string
  size?: number
  mimeType?: string
  uploadedAt: string
}

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onEdit: (updatedEvent: Event) => void
  onDelete: (eventId: string) => void
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'TRAINING': return '#F59E0B' // Orange
    case 'MATCH': return '#EF4444' // Red
    case 'MEETING': return '#3B82F6' // Blue
    case 'MEDICAL': return '#10B981' // Green
    case 'RECOVERY': return '#8B5CF6' // Purple
    default: return '#6B7280' // Gray
  }
}

const getEventIconComponent = (iconName: string, color?: string) => {
  return <CustomIcon name={iconName} className="h-5 w-5" style={{ color }} />
}

export default function EventModal({ event, isOpen, onClose, onEdit, onDelete }: EventModalProps) {
  const { colorScheme } = useTheme()
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
            setMediaFiles(mediaData)
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !event) return

    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/events/${event.id}/media`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setMediaFiles(prev => [result.media, ...prev])
        setShowMediaUpload(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to upload media')
      }
    } catch (error) {
      console.error('Error uploading media:', error)
      alert('Error uploading media')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!event || !confirm('Are you sure you want to delete this media file?')) return

    try {
      const response = await fetch(`/api/events/${event.id}/media/${mediaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMediaFiles(prev => prev.filter(media => media.id !== mediaId))
      } else {
        alert('Failed to delete media')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Error deleting media')
    }
  }

  const getFileIcon = (media: EventMedia) => {
    if (media.type === 'IMAGE') return <Image className="h-8 w-8" />
    if (media.type === 'VIDEO') return <Video className="h-8 w-8" />
    if (media.type === 'AUDIO') return <File className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSave = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      const eventData = {
        ...formData,
        selectedPlayers,
        selectedStaff
      }

      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        onEdit(updatedEvent.event)
        setIsEditing(false)
      } else {
        console.error('Failed to update event')
        alert('Failed to update event.')
      }
    } catch (error) {
      console.error('Error updating event:', error)
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                className="w-full max-w-4xl max-h-[90vh] transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all"
                style={{ backgroundColor: colorScheme.surface }}
              >
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title 
                    as="h3" 
                    className="text-xl font-semibold leading-6"
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

                {isEditing ? (
                  <div className="overflow-y-auto max-h-[70vh] pr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div 
                          className="rounded-lg p-4"
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
                          className="rounded-lg p-4"
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
                      <div className="space-y-6">
                        {/* Players Selection */}
                        <div 
                          className="rounded-lg p-4"
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
                          className="rounded-lg p-4"
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
                    <div className="flex justify-end space-x-3 pt-6 border-t" style={{ borderColor: colorScheme.border }}>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 text-sm font-medium rounded-md transition-colors"
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
                        className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
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
                        <button
                          onClick={() => setShowMediaUpload(true)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </button>
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
                                {media.type === 'IMAGE' ? (
                                  <img
                                    src={media.url}
                                    alt={media.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <div 
                                    className="text-center"
                                    style={{ color: colorScheme.textSecondary }}
                                  >
                                    {getFileIcon(media)}
                                    <p className="text-xs mt-1 truncate px-1">{media.name}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded transition-colors"
                                  style={{
                                    backgroundColor: colorScheme.border,
                                    color: colorScheme.textSecondary
                                  }}
                                  title="View"
                                >
                                  <Eye className="h-3 w-3" />
                                </a>
                                <a
                                  href={media.url}
                                  download={media.name}
                                  className="p-1 rounded transition-colors"
                                  style={{
                                    backgroundColor: colorScheme.border,
                                    color: colorScheme.textSecondary
                                  }}
                                  title="Download"
                                >
                                  <Download className="h-3 w-3" />
                                </a>
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
                          <button
                            onClick={() => setShowMediaUpload(true)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Media
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: colorScheme.border }}>
                      <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Media Upload Modal */}
        {showMediaUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              style={{ backgroundColor: colorScheme.surface }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 
                  className="text-lg font-medium"
                  style={{ color: colorScheme.text }}
                >
                  Upload Media
                </h3>
                <button
                  onClick={() => setShowMediaUpload(false)}
                  className="transition-colors hover:opacity-70"
                  style={{ color: colorScheme.textSecondary }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colorScheme.text }}
                  >
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                
                <div className="text-xs" style={{ color: colorScheme.textSecondary }}>
                  <p>Supported formats: Images, Videos, Audio, PDFs, Documents, Archives</p>
                  <p>Maximum file size: 50MB</p>
                </div>
                
                {uploadingMedia && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <span 
                      className="ml-2 text-sm"
                      style={{ color: colorScheme.text }}
                    >
                      Uploading...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  )
}