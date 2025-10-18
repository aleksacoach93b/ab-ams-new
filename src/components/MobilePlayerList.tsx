'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Phone, Mail, User } from 'lucide-react'

interface Player {
  id: string
  name: string
  position: string
  dateOfBirth: string
  team: string
  status: string
  username: string
  accountSetup: string
  mobileUsed: string
  lastUsed: string
  avatar: string | null
  age: number
  height: string
  weight: string
}

interface MobilePlayerListProps {
  onAddPlayer?: () => void
}

export default function MobilePlayerList({ onAddPlayer }: MobilePlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players')
        if (response.ok) {
          const data = await response.json()
          const transformedPlayers = data.map((player: any) => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            position: player.position || 'Not specified',
            dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : 'Not specified',
            team: player.team?.name || 'No team',
            status: player.availabilityStatus || player.status || 'Unknown',
            username: player.email || player.user?.email || 'No email',
            accountSetup: 'Complete',
            mobileUsed: 'Unknown',
            lastUsed: 'Unknown',
            avatar: player.imageUrl || player.avatar,
            age: player.dateOfBirth ? new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear() : 0,
            height: player.height ? `${player.height} cm` : 'Not specified',
            weight: player.weight ? `${player.weight} kg` : 'Not specified'
          }))
          setPlayers(transformedPlayers)
        }
      } catch (error) {
        console.error('Error fetching players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
      return
    }

    console.log('🗑️ Frontend: Starting delete for player:', playerId)
    setDeleting(playerId)
    try {
      console.log('🗑️ Frontend: Sending DELETE request to:', `/api/players/${playerId}`)
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE'
      })
      
      console.log('🗑️ Frontend: Received response:', response.status, response.statusText)
      
      if (response.ok) {
        setPlayers(players.filter((player: Player) => player.id !== playerId))
        alert('Player deleted successfully')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete player:', errorData)
        console.error('Response status:', response.status)
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        alert(`Failed to delete player: ${errorData.message || errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': 
      case 'fully_available':
      case 'active': 
        return 'text-green-400'
      case 'injured': 
      case 'physio_therapy': 
        return 'text-yellow-400'
      case 'suspended': 
        return 'text-red-400'
      case 'inactive': 
        return 'text-gray-400'
      default: 
        return 'text-blue-400'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': 
      case 'fully_available':
      case 'active': 
        return 'bg-green-400'
      case 'injured': 
      case 'physio_therapy': 
        return 'bg-yellow-400'
      case 'suspended': 
        return 'bg-red-400'
      case 'inactive': 
        return 'bg-gray-400'
      default: 
        return 'bg-blue-400'
    }
  }

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1e293b' }}>
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AB</span>
            </div>
            <h1 className="text-xl font-bold text-white">Players</h1>
          </div>
          <button 
            onClick={onAddPlayer}
            className="text-red-400 font-medium text-sm hover:text-red-300 transition-colors"
          >
            + Add Player
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="px-2 sm:px-4 py-4 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto"></div>
            <p className="text-gray-300 mt-2">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300">No players found</p>
            <button 
              onClick={onAddPlayer}
              className="text-red-400 font-medium mt-2 hover:text-red-300 transition-colors"
            >
              Add your first player
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {players.map((player) => (
              <div 
                key={player.id} 
                className="bg-blue-900 rounded-xl shadow-lg border border-blue-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-700"
              >
                {/* Card Header */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {player.avatar ? (
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {getPlayerInitials(player.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/players/${player.id}`}
                        className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                        title="View Profile"
                      >
                        <User className="h-4 w-4 text-white" />
                      </Link>
                      <Link
                        href={`/dashboard/players/${player.id}/edit`}
                        className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors"
                        title="Edit Player"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </Link>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        disabled={deleting === player.id}
                        className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Player"
                      >
                        {deleting === player.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-3 sm:px-4 pb-4">
                  {/* Player Name */}
                  <h3 className="text-lg font-bold text-white mb-1">
                    {player.name}
                  </h3>
                  
                  {/* Position */}
                  <p className="text-sm text-gray-300 mb-3">
                    {player.position}
                  </p>
                  
                  {/* Player Details */}
                  <div className="space-y-2 text-sm">
                    {/* Age */}
                    <div className="flex items-center text-gray-300">
                      <span className="w-4 h-4 bg-gray-600 rounded-full mr-2"></span>
                      <span>{player.age} years old</span>
                    </div>
                    
                    {/* Height & Weight */}
                    <div className="flex items-center text-gray-300">
                      <span className="w-4 h-4 bg-gray-600 rounded-full mr-2"></span>
                      <span>{player.height} • {player.weight}</span>
                    </div>
                    
                    {/* Team */}
                    <div className="flex items-center text-gray-300">
                      <span className="w-4 h-4 bg-gray-600 rounded-full mr-2"></span>
                      <span>{player.team}</span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(player.status)}`}></div>
                      <span className={`text-sm font-medium ${getStatusColor(player.status)}`}>
                        {player.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
