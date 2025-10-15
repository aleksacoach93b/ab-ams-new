'use client'

import React from 'react'
import CustomIcon from './CustomIcon'
import { useTheme } from '@/contexts/ThemeContext'

interface EventIconSelectorProps {
  selectedIcon?: string
  onIconSelect: (icon: string) => void
}

// Simplified list of only the requested icons
const selectedIcons = [
  { key: 'SoccerPitch', label: 'Football Pitch' },
  { key: 'FootballBall', label: 'Football Ball' },
  { key: 'Dumbbell', label: 'Gym' },
  { key: 'Video', label: 'Video' },
  { key: 'Meeting', label: 'Meeting' },
  { key: 'Recovery', label: 'Recovery' },
  { key: 'BloodSample', label: 'Blood Sample' },
  { key: 'StopwatchWhistle', label: 'Match Timer' },
  { key: 'ElectronicScale', label: 'Electronic Scale' },
  { key: 'Calendar', label: 'Calendar' },
  { key: 'Activity', label: 'Heart Rate' },
  { key: 'Bus', label: 'Bus' },
  { key: 'Plane', label: 'Airplane' },
  { key: 'Car', label: 'Car' },
  { key: 'Camera', label: 'Camera' },
  { key: 'Users', label: 'Team' },
  { key: 'CarArrival', label: 'Arrival', iconKey: 'Car' },
  { key: 'UsersMeeting', label: 'Team Meeting', iconKey: 'Users' },
  { key: 'BedTime', label: 'Bed Time' },
  { key: 'MealPlate', label: 'Meal' },
  { key: 'CoffeeCup', label: 'Coffee' },
]

// Helper function to get event color based on type
const getEventColor = (type: string) => {
  switch (type) {
    case 'TRAINING': return '#F59E0B' // Orange
    case 'MATCH': return '#EF4444' // Red
    case 'MEETING': return '#3B82F6' // Blue
    case 'MEDICAL': return '#10B981' // Green
    case 'RECOVERY': return '#8B5CF6' // Purple
    case 'MEAL': return '#F97316' // Orange-red
    case 'COFFEE': return '#92400E' // Brown
    default: return '#6B7280' // Gray
  }
}

export default function EventIconSelector({ selectedIcon, onIconSelect }: EventIconSelectorProps) {
  const { colorScheme, theme } = useTheme()

  return (
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-700 border-gray-600' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 max-h-60 overflow-y-auto pr-2">
        {selectedIcons.map(({ key, label, iconKey }) => {
          // Determine the color based on the icon type
          const iconColor = getEventColor(key)
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => onIconSelect(key)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
                selectedIcon === key
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : theme === 'dark'
                    ? 'border-gray-600 bg-gray-600 text-gray-300 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
              title={label}
            >
              <CustomIcon 
                name={iconKey || key} 
                className="h-4 w-4 mb-1" 
                style={{ color: iconColor }}
              />
              <span className="text-xs text-center truncate w-full">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}