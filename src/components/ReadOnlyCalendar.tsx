'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye
} from 'lucide-react'
import CustomIcon from './CustomIcon'
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
}

interface ReadOnlyCalendarProps {
  userId?: string
  userRole?: string
}

export default function ReadOnlyCalendar({ userId, userRole }: ReadOnlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { colorScheme } = useTheme()

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = userId && userRole 
          ? `/api/events?userId=${userId}&userRole=${userRole}`
          : '/api/events'
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const transformedEvents = data.map((event: any) => {
            // Use event.date for the date and event.startTime/endTime for times
            const eventDate = event.date ? new Date(event.date) : null
            const startTime = event.startTime || ''
            const endTime = event.endTime || ''
            
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
              startTime: startTime,
              endTime: endTime,
              location: event.location?.name || event.location || '',
              description: event.description || '',
              color: getEventColor(event.type),
              icon: event.icon || 'Calendar',
              media: event.media || []
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
  }, [userId, userRole])

  const getEventColor = (type: string) => {
    switch (type) {
      case 'TRAINING': return '#F59E0B' // Orange
      case 'MATCH': return '#EF4444' // Red
      case 'MEETING': return '#3B82F6' // Blue
      case 'MEDICAL': return '#10B981' // Green
      case 'RECOVERY': return '#8B5CF6' // Purple
      case 'MEAL': return '#F97316' // Orange-red
      case 'REST': return '#6366F1' // Indigo
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
    
    // Filter events for the date and sort by start time
    return events
      .filter(event => event.date === dateStr)
      .sort((a, b) => {
        // Parse start times (format: "HH:MM")
        const timeA = a.startTime || '00:00'
        const timeB = b.startTime || '00:00'
        return timeA.localeCompare(timeB)
      })
  }

  const getEventsForSelectedDate = () => {
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // Filter events for the selected date and sort by start time
    return events
      .filter(event => event.date === dateStr)
      .sort((a, b) => {
        // Sort events by start time
        const timeA = a.startTime.replace(':', '')
        const timeB = b.startTime.replace(':', '')
        return timeA.localeCompare(timeB)
      })
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

  return (
    <div 
      className="w-full"
      style={{ backgroundColor: colorScheme.background }}
    >
      {/* Clean Month Navigation */}
      <div className="px-0 sm:px-2 py-3 w-full" style={{ backgroundColor: colorScheme.surface }}>
        <div className="flex items-center justify-between w-full">
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

      {/* Clean Events Section - NO ADD BUTTON */}
      <div 
        className="px-0 sm:px-2 py-4 w-full"
        style={{ backgroundColor: colorScheme.background }}
      >
        <div className="flex items-center justify-center mb-4">
          <h3 
            className="text-lg font-bold"
            style={{ color: colorScheme.text }}
          >
            {todayEvents.length} Events
          </h3>
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

      {/* Read-Only Event Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div 
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: colorScheme.surface }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: colorScheme.text }}>
                Event Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
                style={{ backgroundColor: colorScheme.errorLight, color: colorScheme.error }}
              >
                ✕
              </button>
            </div>

            {/* Event Content - READ ONLY */}
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: selectedEvent.color + '20' }}
                >
                  <div style={{ color: selectedEvent.color }}>
                    {getEventIcon(selectedEvent)}
                  </div>
                </div>
                <div>
                  <h4 
                    className="text-xl font-semibold"
                    style={{ color: colorScheme.text }}
                  >
                    {selectedEvent.title}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: colorScheme.textSecondary }}
                  >
                    {selectedEvent.type}
                  </p>
                </div>
              </div>

              {/* Event Details */}
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
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
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
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin 
                        className="h-4 w-4" 
                        style={{ color: colorScheme.textSecondary }}
                      />
                      <span 
                        className="text-sm"
                        style={{ color: colorScheme.text }}
                      >
                        {selectedEvent.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
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
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t" style={{ borderColor: colorScheme.border }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{
                    backgroundColor: colorScheme.primary,
                    color: 'white'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
