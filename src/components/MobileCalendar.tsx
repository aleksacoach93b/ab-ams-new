'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff
} from 'lucide-react'
import CustomIcon from './CustomIcon'
import EventModal from './EventModal'
import { useTheme } from '@/contexts/ThemeContext'

interface EventMedia {
  id: string
  name: string
  type: string
  url: string
  size?: number
  mimeType?: string
  uploadedAt: string
}

interface Event {
  id: string
  title: string
  type: string
  date: string
  startTime: string
  endTime: string
  location?: string
  description?: string
  color: string
  icon?: string
  media?: EventMedia[]
  selectedPlayers?: string[]
  selectedStaff?: string[]
}

interface MobileCalendarProps {
  onEventClick?: (event: Event) => void
  onAddEvent?: () => void
  user?: {
    role?: string
    id?: string
  } | null
  staffPermissions?: {
    canCreateEvents?: boolean
    canEditEvents?: boolean
    canDeleteEvents?: boolean
  }
  showAddButtons?: boolean
}

export default function MobileCalendar({ onEventClick, onAddEvent, user, staffPermissions, showAddButtons = true }: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const { colorScheme } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Check if user can manage events
  const canManageEvents = () => {
    if (!showAddButtons) return false
    if (user?.role === 'ADMIN' || user?.role === 'COACH') {
      return true
    }
    if (user?.role === 'STAFF' && staffPermissions?.canCreateEvents) {
      return true
    }
    return false
  }
  
  // Modern UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          const transformedEvents = data.map((event: any) => {
            // Parse the event date from the API response
            const eventDate = event.date ? new Date(event.date) : null
            
            // Format date in local timezone to avoid UTC conversion issues
            const formatLocalDate = (date: Date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
            
            // Extract participant IDs from the participants array
            const selectedPlayers = event.participants
              ?.filter((p: any) => p.playerId)
              ?.map((p: any) => p.playerId) || []
            
            const selectedStaff = event.participants
              ?.filter((p: any) => p.staffId)
              ?.map((p: any) => p.staffId) || []

            return {
              id: event.id,
              title: event.title,
              type: event.type,
              date: eventDate ? formatLocalDate(eventDate) : '',
              startTime: event.startTime || '',
              endTime: event.endTime || '',
              location: event.location?.name || '',
              description: event.description || '',
              color: getEventColor(event.type),
              icon: event.icon || 'Calendar',
              media: event.media || [],
              selectedPlayers,
              selectedStaff
            }
          })
          setEvents(transformedEvents)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

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

  const getEventIcon = (event: Event) => {
    return <CustomIcon name={event.icon || 'Calendar'} className="h-4 w-4" style={{ color: event.color }} />
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return events.filter(event => event.date === dateStr)
  }

  const getEventsForSelectedDate = () => {
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    let filteredEvents = events.filter(event => event.date === dateStr)
    
    // Apply type filters if any are selected
    if (selectedEventTypes.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        selectedEventTypes.includes(event.type)
      )
    }
    
    // Sort events by start time
    filteredEvents.sort((a, b) => {
      const timeA = a.startTime.replace(':', '')
      const timeB = b.startTime.replace(':', '')
      return timeA.localeCompare(timeB)
    })
    
    return filteredEvents
  }

  // Get unique event types for filtering
  const getEventTypes = () => {
    const types = [...new Set(events.map(event => event.type))]
    return types
  }

  // Toggle event type filter
  const toggleEventTypeFilter = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedEventTypes([])
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthDays = getDaysInMonth(currentDate)
  const todayEvents = getEventsForSelectedDate()

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleEditEvent = async (updatedEvent: Event) => {
    // Refresh events from API after edit
    const response = await fetch('/api/events')
    if (response.ok) {
      const data = await response.json()
      const transformedEvents = data.map((event: any) => {
        // Extract participant IDs from the participants array
        const selectedPlayers = event.participants
          ?.filter((p: any) => p.playerId)
          ?.map((p: any) => p.playerId) || []
        
        const selectedStaff = event.participants
          ?.filter((p: any) => p.staffId)
          ?.map((p: any) => p.staffId) || []

        // Parse the event date from the API response
        const eventDate = event.date ? new Date(event.date) : null
        
        // Format date in local timezone to avoid UTC conversion issues
        const formatLocalDate = (date: Date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        return {
          id: event.id,
          title: event.title,
          type: event.type,
          date: eventDate ? formatLocalDate(eventDate) : '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          location: event.location || '',
          description: event.description || '',
          color: getEventColor(event.type),
          icon: event.icon || 'Calendar',
          selectedPlayers,
          selectedStaff
        }
      })
      setEvents(transformedEvents)
    }
    setIsModalOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
    setIsModalOpen(false)
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: colorScheme.background }}
    >
      {/* Clean Header */}
      <div 
        className="sticky top-0 px-1 sm:px-6 py-4 z-20"
        style={{ backgroundColor: colorScheme.surface }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              AB
            </div>
            <h1 
              className="text-xl font-bold"
              style={{ color: colorScheme.text, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Calendar
            </h1>
          </div>
          
          {canManageEvents() && (
            <button
              onClick={onAddEvent}
              className="text-sm font-medium"
              style={{ color: colorScheme.primary }}
            >
              + Add
            </button>
          )}
        </div>
      </div>

      {/* Clean Month Navigation */}
      <div className="px-0 sm:px-2 py-3 w-full" style={{ backgroundColor: colorScheme.surface }}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigateMonth('prev')} 
            className="p-2"
            style={{ color: colorScheme.textSecondary }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 
              className="text-lg font-bold"
              style={{ color: colorScheme.text }}
            >
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <button 
            onClick={() => navigateMonth('next')} 
            className="p-2"
            style={{ color: colorScheme.textSecondary }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Clean Calendar Grid */}
      <div className="px-0 sm:px-2 pb-4 w-full" style={{ backgroundColor: colorScheme.surface }}>
        {/* Day headers */}
        <div 
          className="grid grid-cols-7 text-center text-xs font-medium py-2"
          style={{ color: colorScheme.textSecondary }}
        >
          {days.map((day, index) => (
            <div key={index} className="py-2">{day}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-12"></div>
            }

            const dayIsToday = isToday(day)
            const dayIsSelected = isSelectedDate(day)
            const dayEvents = getEventsForDate(day)

            return (
              <div
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                className="h-12 flex flex-col items-center justify-center cursor-pointer relative rounded-lg"
                style={{
                  backgroundColor: dayIsSelected ? colorScheme.primaryLight : 'transparent',
                  border: dayIsSelected ? `1px solid ${colorScheme.primary}` : 'none'
                }}
                onClick={() => setSelectedDate(day)}
              >
                <div 
                  className={`text-sm font-medium ${
                    dayIsToday ? 'font-bold' : ''
                  }`}
                  style={{ 
                    color: dayIsSelected 
                      ? '#FFFFFF' 
                      : dayIsToday 
                        ? colorScheme.primary 
                        : colorScheme.text 
                  }}
                >
                  {day.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: event.color }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Clean Events Section */}
      <div 
        className="px-0 sm:px-2 py-4 w-full"
        style={{ backgroundColor: colorScheme.background }}
      >
        <div className="flex items-center justify-center mb-4 relative">
          <h3 
            className="text-lg font-bold"
            style={{ color: colorScheme.text }}
          >
            {todayEvents.length} Events
          </h3>
          
          {canManageEvents() && (
            <button
              onClick={onAddEvent}
              className="text-sm font-medium absolute right-0"
              style={{ color: colorScheme.primary }}
            >
              + Add
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="animate-pulse p-3 rounded-lg"
                style={{ backgroundColor: colorScheme.surface }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: colorScheme.border }}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div 
                      className="h-3 rounded w-3/4"
                      style={{ backgroundColor: colorScheme.border }}
                    ></div>
                    <div 
                      className="h-2 rounded w-1/2"
                      style={{ backgroundColor: colorScheme.border }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : todayEvents.length === 0 ? (
          <div 
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <Calendar 
              className="h-8 w-8 mx-auto mb-3 opacity-50"
              style={{ color: colorScheme.textSecondary }}
            />
            <h4 
              className="text-base font-medium mb-2"
              style={{ color: colorScheme.text }}
            >
              No events scheduled
            </h4>
            <p 
              className="text-sm"
              style={{ color: colorScheme.textSecondary }}
            >
              This date is free.
            </p>
            {canManageEvents() && (
              <button
                onClick={onAddEvent}
                className="text-sm font-medium"
                style={{ color: colorScheme.primary }}
              >
                + Add Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 px-2">
            {todayEvents.map((event, index) => (
              <div
                key={event.id}
                className="px-3 py-3 rounded-lg cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: colorScheme.surface,
                  border: `1px solid ${colorScheme.border}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => handleEventClick(event)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.background
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colorScheme.surface
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${event.color}20` }}
                  >
                    <div style={{ color: event.color }}>
                      {getEventIcon(event)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2"
                        style={{ 
                          backgroundColor: `${event.color}20`,
                          color: event.color
                        }}
                      >
                        {event.type}
                      </span>
                    </div>
                    
                    <h4 
                      className="text-sm font-semibold mb-1"
                      style={{ color: colorScheme.text }}
                    >
                      {event.title}
                    </h4>
                    
                    {event.description && (
                      <div className="text-xs" style={{ color: colorScheme.textSecondary }}>
                        {event.description}
                      </div>
                    )}
                  </div>
                  
                  {/* Start and End Times on the right */}
                  <div className="flex flex-col items-end text-right">
                    <div 
                      className="text-xs font-medium"
                      style={{ color: colorScheme.text }}
                    >
                      {event.startTime}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: colorScheme.textSecondary }}
                    >
                      {event.endTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        user={user}
        staffPermissions={staffPermissions}
      />
    </div>
  )
}
