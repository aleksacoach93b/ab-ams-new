'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, User, Mail, Phone, Calendar, Shield, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  department?: string
  experience?: number
  isActive: boolean
  createdAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
  }
  // Permissions
  canCreateEvents: boolean
  canEditEvents: boolean
  canDeleteEvents: boolean
  canViewAllPlayers: boolean
  canEditPlayers: boolean
  canDeletePlayers: boolean
  canAddPlayerMedia: boolean
  canEditPlayerMedia: boolean
  canDeletePlayerMedia: boolean
  canAddPlayerNotes: boolean
  canEditPlayerNotes: boolean
  canDeletePlayerNotes: boolean
  canViewCalendar: boolean
  canViewDashboard: boolean
  canManageStaff: boolean
  canViewReports: boolean
}

export default function StaffPage() {
  const { colorScheme } = useTheme()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStaff(staff.filter(s => s.id !== id))
      } else {
        alert('Failed to delete staff member')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Error deleting staff member')
    }
  }

  const getPermissionCount = (staffMember: Staff) => {
    const permissions = [
      staffMember.canCreateEvents,
      staffMember.canEditEvents,
      staffMember.canDeleteEvents,
      staffMember.canViewAllPlayers,
      staffMember.canEditPlayers,
      staffMember.canDeletePlayers,
      staffMember.canAddPlayerMedia,
      staffMember.canEditPlayerMedia,
      staffMember.canDeletePlayerMedia,
      staffMember.canAddPlayerNotes,
      staffMember.canEditPlayerNotes,
      staffMember.canDeletePlayerNotes,
      staffMember.canViewCalendar,
      staffMember.canViewDashboard,
      staffMember.canManageStaff,
      staffMember.canViewReports
    ]
    return permissions.filter(Boolean).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2" style={{ color: colorScheme.textSecondary }}>
            Loading staff...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colorScheme.background }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colorScheme.text }}>
            Staff Management
          </h1>
          <p className="text-lg mt-2" style={{ color: colorScheme.textSecondary }}>
            Manage your team staff and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((staffMember) => (
          <div
            key={staffMember.id}
            className="rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            style={{ backgroundColor: colorScheme.surface }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: colorScheme.primary }}
                >
                  {staffMember.firstName.charAt(0)}{staffMember.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: colorScheme.text }}>
                    {staffMember.firstName} {staffMember.lastName}
                  </h3>
                  <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                    {staffMember.position || 'Staff Member'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingStaff(staffMember)}
                  className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
                  style={{ backgroundColor: colorScheme.primaryLight }}
                >
                  <Edit className="h-4 w-4" style={{ color: colorScheme.primary }} />
                </button>
                <button
                  onClick={() => handleDeleteStaff(staffMember.id)}
                  className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
                  style={{ backgroundColor: colorScheme.errorLight }}
                >
                  <Trash2 className="h-4 w-4" style={{ color: colorScheme.error }} />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
                  {staffMember.email}
                </span>
              </div>
              {staffMember.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                  <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
                    {staffMember.phone}
                  </span>
                </div>
              )}
              {staffMember.department && (
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                  <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
                    {staffMember.department}
                  </span>
                </div>
              )}
            </div>

            {/* Status and Permissions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${staffMember.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                ></div>
                <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
                  {staffMember.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                <span className="text-sm" style={{ color: colorScheme.textSecondary }}>
                  {getPermissionCount(staffMember)} permissions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {staff.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colorScheme.text }}>
            No staff members yet
          </h3>
          <p className="mb-4" style={{ color: colorScheme.textSecondary }}>
            Add your first staff member to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Add Staff Member
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingStaff) && (
        <StaffModal
          staff={editingStaff}
          onClose={() => {
            setShowAddModal(false)
            setEditingStaff(null)
          }}
          onSave={() => {
            fetchStaff()
            setShowAddModal(false)
            setEditingStaff(null)
          }}
        />
      )}
    </div>
  )
}

// Staff Modal Component
function StaffModal({ 
  staff, 
  onClose, 
  onSave 
}: { 
  staff: Staff | null
  onClose: () => void
  onSave: () => void
}) {
  const { colorScheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    password: '',
    phone: staff?.phone || '',
    dateOfBirth: staff?.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '',
    position: staff?.position || '',
    department: staff?.department || '',
    experience: staff?.experience?.toString() || '',
    certifications: staff?.certifications ? JSON.parse(staff.certifications) : [],
    permissions: {
      canCreateEvents: staff?.canCreateEvents || false,
      canEditEvents: staff?.canEditEvents || false,
      canDeleteEvents: staff?.canDeleteEvents || false,
      canViewAllPlayers: staff?.canViewAllPlayers !== undefined ? staff.canViewAllPlayers : true,
      canEditPlayers: staff?.canEditPlayers || false,
      canDeletePlayers: staff?.canDeletePlayers || false,
      canAddPlayerMedia: staff?.canAddPlayerMedia || false,
      canEditPlayerMedia: staff?.canEditPlayerMedia || false,
      canDeletePlayerMedia: staff?.canDeletePlayerMedia || false,
      canAddPlayerNotes: staff?.canAddPlayerNotes || false,
      canEditPlayerNotes: staff?.canEditPlayerNotes || false,
      canDeletePlayerNotes: staff?.canDeletePlayerNotes || false,
      canViewCalendar: staff?.canViewCalendar !== undefined ? staff.canViewCalendar : true,
      canViewDashboard: staff?.canViewDashboard !== undefined ? staff.canViewDashboard : true,
      canManageStaff: staff?.canManageStaff || false,
      canViewReports: staff?.canViewReports || false
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = staff ? `/api/staff/${staff.id}` : '/api/staff'
      const method = staff ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save staff member')
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Error saving staff member')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colorScheme.surface }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colorScheme.text }}>
              {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
              style={{ backgroundColor: colorScheme.errorLight }}
            >
              <EyeOff className="h-5 w-5" style={{ color: colorScheme.error }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Password {staff ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!staff}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Physiotherapist, Nutritionist"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  >
                    <option value="">Select Department</option>
                    <option value="Medical">Medical</option>
                    <option value="Performance">Performance</option>
                    <option value="Administration">Administration</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: colorScheme.background,
                      borderColor: colorScheme.border,
                      color: colorScheme.text
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colorScheme.text }}>
                Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium" style={{ color: colorScheme.text }}>
                    Events
                  </h4>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canCreateEvents"
                      checked={formData.permissions.canCreateEvents}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Create Events
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canEditEvents"
                      checked={formData.permissions.canEditEvents}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Edit Events
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canDeleteEvents"
                      checked={formData.permissions.canDeleteEvents}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Delete Events
                    </span>
                  </label>
                </div>

                {/* Player Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium" style={{ color: colorScheme.text }}>
                    Players
                  </h4>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canViewAllPlayers"
                      checked={formData.permissions.canViewAllPlayers}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      View All Players
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canEditPlayers"
                      checked={formData.permissions.canEditPlayers}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Edit Players
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canAddPlayerMedia"
                      checked={formData.permissions.canAddPlayerMedia}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Add Player Media
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canAddPlayerNotes"
                      checked={formData.permissions.canAddPlayerNotes}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Add Player Notes
                    </span>
                  </label>
                </div>

                {/* System Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium" style={{ color: colorScheme.text }}>
                    System
                  </h4>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canViewCalendar"
                      checked={formData.permissions.canViewCalendar}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      View Calendar
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canViewDashboard"
                      checked={formData.permissions.canViewDashboard}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      View Dashboard
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canManageStaff"
                      checked={formData.permissions.canManageStaff}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      Manage Staff
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="canViewReports"
                      checked={formData.permissions.canViewReports}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: colorScheme.text }}>
                      View Reports
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t" style={{ borderColor: colorScheme.border }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={{ 
                  backgroundColor: colorScheme.background,
                  borderColor: colorScheme.border,
                  color: colorScheme.text
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Add Staff')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
