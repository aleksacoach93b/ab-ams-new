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
            name: `${player.firstName} ${player.lastName}`,
            position: player.position || 'Not specified',
            dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : 'Not specified',
            team: player.teamName || 'No team',
            status: player.status || 'Unknown',
            username: player.userEmail || 'No email',
            accountSetup: 'Complete',
            mobileUsed: 'Unknown',
            lastUsed: 'Unknown',
            avatar: player.avatar,
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

    setDeleting(playerId)
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPlayers(players.filter((player: Player) => player.id !== playerId))
      } else {
        alert('Failed to delete player')
      }
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'injured': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AB</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Players</h1>
          </div>
          <button 
            onClick={onAddPlayer}
            className="text-red-600 font-medium text-sm"
          >
            + Add Player
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 py-4 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No players found</p>
            <button 
              onClick={onAddPlayer}
              className="text-red-600 font-medium mt-2"
            >
              Add your first player
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {player.avatar ? (
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {player.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(player.status)}`}>
                          {player.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{player.position}</span>
                          <span>#{player.id}</span>
                          <span>{player.age} years old</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>{player.height}</span>
                          <span>{player.weight}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {player.team}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-3">
                    <Link
                      href={`/dashboard/players/${player.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Profile"
                    >
                      <User className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/players/${player.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Player"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      disabled={deleting === player.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete Player"
                    >
                      {deleting === player.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
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
