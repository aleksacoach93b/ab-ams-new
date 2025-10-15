'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Users, TrendingUp, Clock, User, Activity, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import MobileCalendar from '@/components/MobileCalendar'

interface Player {
  id: string
  firstName: string
  lastName: string
  email?: string
  position?: string
  status?: string
  avatar?: string
  dateOfBirth?: string
  height?: number
  weight?: number
}

interface Event {
  id: string
  title: string
  description?: string
  type: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  participants: Player[]
}

export default function Dashboard() {
  const { colorScheme } = useTheme()
  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
    fetchEvents()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalPlayers = players.length
  const activePlayers = players.filter(p => p.status === 'ACTIVE' || p.status === 'FULLY_AVAILABLE').length
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length

  // Get next 7 days events
  const nextWeekEvents = events
    .filter(e => {
      const eventDate = new Date(e.date)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= today && eventDate <= nextWeek
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getEventColor = (type: string) => {
    const colors = {
      TRAINING: '#3B82F6',
      MATCH: '#EF4444',
      MEETING: '#10B981',
      MEDICAL: '#F59E0B',
      RECOVERY: '#8B5CF6',
      MEAL: '#F97316',
      COFFEE: '#92400E',
      OTHER: '#6B7280'
    }
    return colors[type as keyof typeof colors] || colors.OTHER
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: colorScheme.primary }} />
          <p style={{ color: colorScheme.text }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 space-y-6" style={{ backgroundColor: colorScheme.background }}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colorScheme.text }}>
          AB - Athlete Management System
        </h1>
        <p className="text-lg" style={{ color: colorScheme.textSecondary }}>
          Dashboard Overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-3" style={{ color: colorScheme.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Total Players</p>
              <p className="text-2xl font-bold" style={{ color: colorScheme.text }}>{totalPlayers}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" style={{ color: colorScheme.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Active Players</p>
              <p className="text-2xl font-bold" style={{ color: colorScheme.text }}>{activePlayers}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 mr-3" style={{ color: colorScheme.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Upcoming Events</p>
              <p className="text-2xl font-bold" style={{ color: colorScheme.text }}>{upcomingEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: colorScheme.text }}>
              Players Overview
            </h2>
            <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
              {totalPlayers} players
            </span>
          </div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {players.map((player) => {
              // Status options
              const statusOptions = [
                { value: 'FULLY_AVAILABLE', label: 'Fully Available', color: '#10B981' },
                { value: 'PARTIAL_TRAINING', label: 'Partial Available - Training', color: '#F59E0B' },
                { value: 'PARTIAL_TEAM_INDIVIDUAL', label: 'Partial Available - Team + Individual', color: '#F97316' },
                { value: 'REHAB_INDIVIDUAL', label: 'Rehab - Individual', color: '#EF4444' },
                { value: 'NOT_AVAILABLE_INJURY', label: 'Not Available - Injury', color: '#92400E' },
                { value: 'PARTIAL_ILLNESS', label: 'Partial Available - Illness', color: '#F59E0B' },
                { value: 'NOT_AVAILABLE_ILLNESS', label: 'Not Available - Illness', color: '#DC2626' },
                { value: 'INDIVIDUAL_WORK', label: 'Individual Work', color: '#2563EB' },
                { value: 'RECOVERY', label: 'Recovery', color: '#2563EB' },
                { value: 'NOT_AVAILABLE_OTHER', label: 'Not Available - Other', color: '#6B7280' },
                { value: 'DAY_OFF', label: 'Day Off', color: '#059669' },
                { value: 'NATIONAL_TEAM', label: 'National Team', color: '#7C3AED' },
                { value: 'PHYSIO_THERAPY', label: 'Physio Therapy', color: '#92400E' },
                { value: 'ACTIVE', label: 'Active', color: '#10B981' },
                { value: 'INJURED', label: 'Injured', color: '#92400E' },
                { value: 'SUSPENDED', label: 'Suspended', color: '#6B7280' },
                { value: 'INACTIVE', label: 'Inactive', color: '#6B7280' },
                { value: 'RETIRED', label: 'Retired', color: '#6B7280' }
              ]
              
              const currentStatusOption = statusOptions.find(opt => opt.value === player.status) || statusOptions[0]
              
              return (
                <div 
                  key={player.id} 
                  className="rounded-lg border p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  style={{ 
                    backgroundColor: colorScheme.background, 
                    borderColor: colorScheme.border,
                    boxShadow: `0 1px 3px ${colorScheme.border}20`
                  }}
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-3">
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={`${player.firstName} ${player.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: colorScheme.border }}
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-white border-2"
                        style={{ 
                          backgroundColor: colorScheme.primary,
                          borderColor: colorScheme.border
                        }}
                      >
                        {player.firstName[0]}{player.lastName[0]}
                      </div>
                    )}
                  </div>
                  
                  {/* Player Name */}
                  <h3 className="text-center font-semibold mb-4 text-sm" style={{ color: colorScheme.text }}>
                    {player.firstName} {player.lastName}
                  </h3>
                  
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={player.status || 'ACTIVE'}
                      onChange={async (e) => {
                        const newStatus = e.target.value
                        try {
                          const response = await fetch(`/api/players/${player.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                          })
                          
                          if (response.ok) {
                            // Update local state
                            setPlayers(prev => prev.map(p => 
                              p.id === player.id ? { ...p, status: newStatus } : p
                            ))
                          } else {
                            console.error('Failed to update player status')
                          }
                        } catch (error) {
                          console.error('Error updating player status:', error)
                        }
                      }}
                      className="w-full px-3 py-2 text-xs font-medium rounded-full border transition-colors"
                      style={{ 
                        backgroundColor: currentStatusOption.color + '20',
                        color: currentStatusOption.color,
                        borderColor: colorScheme.border
                      }}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colorScheme.text }}>
            Upcoming Events
          </h2>
          
          {nextWeekEvents.length > 0 ? (
            <div className="space-y-3">
              {nextWeekEvents.map((event) => (
                <div key={event.id} className="flex items-center p-3 rounded-lg"
                     style={{ backgroundColor: colorScheme.background }}>
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: colorScheme.text }}>
                      {event.title}
                    </p>
                    <div className="flex items-center space-x-4 text-sm" style={{ color: colorScheme.textSecondary }}>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(event.date)}
                      </span>
                      {event.startTime && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(event.startTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4" style={{ color: colorScheme.textSecondary }}>
              No upcoming events
            </p>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: colorScheme.surface, borderColor: colorScheme.border }}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colorScheme.text }}>
            Calendar
          </h2>
          <MobileCalendar />
        </div>
      </div>
    </div>
  )
}