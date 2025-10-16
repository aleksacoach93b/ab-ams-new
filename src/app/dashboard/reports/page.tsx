'use client'

import React, { useState, useEffect } from 'react'
import { 
  FolderPlus, 
  Upload, 
  FolderOpen, 
  File, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  MoreVertical,
  Download,
  Share2,
  Settings,
  EyeIcon
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface ReportFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  parent?: ReportFolder
  children: ReportFolder[]
  reports: Report[]
  visibility: ReportVisibility[]
  _count: {
    reports: number
    children: number
  }
}

interface Report {
  id: string
  title: string
  description?: string
  folderId: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  thumbnailUrl?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  folder: ReportFolder
  visibility: ReportVisibility[]
}

interface ReportVisibility {
  id: string
  reportId?: string
  folderId?: string
  userId: string
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
}

interface User {
  id: string
  firstName: string
  lastName: string
  role: string
}

export default function ReportsPage() {
  const { colorScheme } = useTheme()
  const { user } = useAuth()
  const [folders, setFolders] = useState<ReportFolder[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [staffPermissions, setStaffPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState<ReportFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<ReportFolder | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUploadReport, setShowUploadReport] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Report | ReportFolder | null>(null)
  const [previewFile, setPreviewFile] = useState<Report | null>(null)

  useEffect(() => {
    fetchData()
    fetchStaffPermissions()
    // Initially fetch root level reports (no folder assigned)
    fetchReports()
  }, [])

  const fetchData = async () => {
    try {
      const [foldersResponse, usersResponse] = await Promise.all([
        fetch(`/api/reports/folders?userId=${user?.id}`),
        fetch('/api/players') // Get users from players API for now
      ])

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json()
        setFolders(foldersData)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffPermissions = async () => {
    try {
      if (user?.role === 'STAFF') {
        const response = await fetch('/api/staff')
        if (response.ok) {
          const staffData = await response.json()
          const currentStaff = staffData.find((staff: any) => staff.userId === user?.id)
          if (currentStaff) {
            setStaffPermissions(currentStaff)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching staff permissions:', error)
    }
  }

  const fetchReports = async (folderId?: string) => {
    try {
      // If folderId is provided, fetch reports for that folder
      // If no folderId, fetch root level reports (no folder assigned)
      const url = folderId 
        ? `/api/reports?userId=${user?.id}&folderId=${folderId}`
        : `/api/reports?userId=${user?.id}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const navigateToFolder = (folder: ReportFolder) => {
    setCurrentPath(prev => [...prev, folder])
    setSelectedFolder(folder)
    fetchReports(folder.id)
  }

  const navigateUp = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1)
      setCurrentPath(newPath)
      const parentFolder = newPath[newPath.length - 1] || null
      setSelectedFolder(parentFolder)
      fetchReports(parentFolder?.id)
    }
  }

  const handleCreateFolder = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/reports/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          parentId: selectedFolder?.id || null,
          createdBy: user?.id
        })
      })

      if (response.ok) {
        await fetchData()
        setShowCreateFolder(false)
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleUploadReport = async (title: string, description: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('folderId', selectedFolder?.id || 'null')
      formData.append('createdBy', user?.id || '')
      formData.append('file', file)

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchReports(selectedFolder?.id)
        setShowUploadReport(false)
      }
    } catch (error) {
      console.error('Error uploading report:', error)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/reports/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData()
        if (selectedFolder?.id === folderId) {
          navigateUp()
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchReports(selectedFolder?.id)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const trackFileAccess = async (reportId: string, action: 'view' | 'download') => {
    try {
      await fetch('/api/analytics/file-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          userId: user?.id,
          action
        })
      })
    } catch (error) {
      console.error('Error tracking file access:', error)
      // Don't throw error - analytics failure shouldn't break the UI
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('video/')) return '🎥'
    if (fileType.startsWith('audio/')) return '🎵'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('document') || fileType.includes('word')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    return '📁'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <FolderOpen className="h-12 w-12 animate-pulse mx-auto mb-4" style={{ color: colorScheme.primary }} />
          <p style={{ color: colorScheme.text }}>Loading reports...</p>
        </div>
      </div>
    )
  }

  // Check permissions
  const hasReportsPermission = user?.role === 'ADMIN' || 
                               user?.role === 'COACH' || 
                               (user?.role === 'STAFF' && staffPermissions?.canViewReports)

  if (!hasReportsPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: colorScheme.text }}>Access Denied</h1>
          <p style={{ color: colorScheme.textSecondary }}>You don't have permission to view reports.</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 px-4 py-2 rounded-lg font-medium"
            style={{ 
              backgroundColor: colorScheme.primary, 
              color: 'white' 
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: colorScheme.background }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colorScheme.text }}>
              Reports Management
            </h1>
            <div className="flex items-center space-x-2 text-sm" style={{ color: colorScheme.textSecondary }}>
              <span>📁</span>
              <span>Reports</span>
              {currentPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <span>/</span>
                  <span>{folder.name}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: colorScheme.surface, 
                borderColor: colorScheme.border,
                color: colorScheme.text
              }}
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowUploadReport(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: colorScheme.surface, 
                borderColor: colorScheme.border,
                color: colorScheme.text
              }}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {currentPath.length > 0 && (
        <div className="mb-4">
          <button
            onClick={navigateUp}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors"
            style={{ 
              backgroundColor: colorScheme.surface, 
              borderColor: colorScheme.border,
              color: colorScheme.text
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {folders.filter(folder => folder.parentId === (selectedFolder?.id || null)).map((folder) => (
          <div
            key={folder.id}
            className="p-4 rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
            style={{ 
              backgroundColor: colorScheme.surface, 
              borderColor: colorScheme.border 
            }}
            onClick={() => navigateToFolder(folder)}
          >
            <div className="flex items-start justify-between mb-3">
              <FolderOpen className="h-8 w-8" style={{ color: '#7C3AED' }} />
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(folder)
                    setShowVisibilityModal(true)
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Users className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                  className="p-1 rounded hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mb-1" style={{ color: colorScheme.text }}>
              {folder.name}
            </h3>
            {folder.description && (
              <p className="text-sm mb-2" style={{ color: colorScheme.textSecondary }}>
                {folder.description}
              </p>
            )}
            <div className="flex justify-between text-xs" style={{ color: colorScheme.textSecondary }}>
              <span>{folder._count.reports} reports</span>
              <span>{folder._count.children} folders</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-lg border hover:shadow-lg transition-shadow"
            style={{ 
              backgroundColor: colorScheme.surface, 
              borderColor: colorScheme.border 
            }}
          >
            <div className="flex items-start justify-between mb-3">
              {report.fileType === 'application/pdf' && report.thumbnailUrl ? (
                <div className="w-12 h-16 rounded border overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                  <img
                    src={report.thumbnailUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if thumbnail fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling!.style.display = 'block'
                    }}
                  />
                  <span className="text-2xl hidden">{getFileIcon(report.fileType)}</span>
                </div>
              ) : (
                <span className="text-2xl">{getFileIcon(report.fileType)}</span>
              )}
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    trackFileAccess(report.id, 'view')
                    setPreviewFile(report)
                    setShowPreviewModal(true)
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(report)
                    setShowVisibilityModal(true)
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Users className="h-4 w-4" style={{ color: colorScheme.textSecondary }} />
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-1 rounded hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mb-1" style={{ color: colorScheme.text }}>
              {report.title}
            </h3>
            {report.description && (
              <p className="text-sm mb-2" style={{ color: colorScheme.textSecondary }}>
                {report.description}
              </p>
            )}
            <div className="flex justify-between text-xs" style={{ color: colorScheme.textSecondary }}>
              <span>{formatFileSize(report.fileSize)}</span>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-md w-full mx-4"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.text }}>
              Create New Folder
            </h2>
            <CreateFolderForm
              onSubmit={handleCreateFolder}
              onCancel={() => setShowCreateFolder(false)}
              colorScheme={colorScheme}
            />
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-md w-full mx-4"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.text }}>
              Upload Report
            </h2>
            <UploadReportForm
              onSubmit={handleUploadReport}
              onCancel={() => setShowUploadReport(false)}
              colorScheme={colorScheme}
            />
          </div>
        </div>
      )}

      {/* Visibility Modal */}
      {showVisibilityModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-lg w-full mx-4"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.text }}>
              Manage Visibility
            </h2>
            <VisibilityManager
              item={selectedItem}
              users={users}
              onCancel={() => {
                setShowVisibilityModal(false)
                setSelectedItem(null)
              }}
              colorScheme={colorScheme}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div 
            className="p-4 rounded-lg w-full h-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-lg font-bold truncate flex-1 mr-2" style={{ color: colorScheme.text }}>
                {previewFile.title}
              </h2>
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  setPreviewFile(null)
                }}
                className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <Trash2 className="h-5 w-5" style={{ color: colorScheme.textSecondary }} />
              </button>
            </div>
            
            <div className="mb-3 flex-shrink-0">
              {previewFile.description && (
                <p className="text-sm mb-2" style={{ color: colorScheme.textSecondary }}>
                  {previewFile.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs" style={{ color: colorScheme.textSecondary }}>
                <span>Size: {formatFileSize(previewFile.fileSize)}</span>
                <span>Type: {previewFile.fileType}</span>
                <span>Created: {new Date(previewFile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden" style={{ borderColor: colorScheme.border }}>
              <FilePreview 
                file={previewFile} 
                colorScheme={colorScheme}
              />
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => {
                  trackFileAccess(previewFile.id, 'download')
                  const link = document.createElement('a')
                  link.href = previewFile.fileUrl
                  link.download = previewFile.fileName
                  link.click()
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium"
                style={{ 
                  backgroundColor: 'transparent', 
                  borderColor: colorScheme.border,
                  color: colorScheme.text
                }}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  setPreviewFile(null)
                }}
                className="px-4 py-2 rounded-lg font-medium"
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
      )}
    </div>
  )
}

// Create Folder Form Component
function CreateFolderForm({ onSubmit, onCancel, colorScheme }: any) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), description.trim() || undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          Folder Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colorScheme.background, 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colorScheme.background, 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
          rows={3}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 py-2 px-4 rounded-lg font-medium"
          style={{ 
            backgroundColor: colorScheme.primary, 
            color: 'white' 
          }}
        >
          Create Folder
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg border font-medium"
          style={{ 
            backgroundColor: 'transparent', 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Upload Report Form Component
function UploadReportForm({ onSubmit, onCancel, colorScheme }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && file) {
      onSubmit(title.trim(), description.trim() || undefined, file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          Report Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colorScheme.background, 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colorScheme.background, 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          File
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colorScheme.background, 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
          required
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 py-2 px-4 rounded-lg font-medium"
          style={{ 
            backgroundColor: colorScheme.primary, 
            color: 'white' 
          }}
        >
          Upload Report
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg border font-medium"
          style={{ 
            backgroundColor: 'transparent', 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Visibility Manager Component
function VisibilityManager({ item, users, onCancel, colorScheme }: any) {
  const [visibility, setVisibility] = useState<any[]>([])

  useEffect(() => {
    // Initialize visibility array with all users
    const initialVisibility = users.map((user: User) => ({
      userId: user.id,
      canView: false,
      canEdit: false,
      canDelete: false
    }))
    setVisibility(initialVisibility)
  }, [users])

  const handleSubmit = async () => {
    try {
      const endpoint = 'reportId' in item ? `/api/reports/${item.id}` : `/api/reports/folders/${item.id}`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visibility })
      })

      if (response.ok) {
        onCancel()
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
    }
  }

  const updateVisibility = (userId: string, permission: string, value: boolean) => {
    setVisibility(prev => prev.map(vis => 
      vis.userId === userId 
        ? { ...vis, [permission]: value }
        : vis
    ))
  }

  return (
    <div className="space-y-4">
      <div className="max-h-64 overflow-y-auto">
        {users.map((user: User) => {
          const userVisibility = visibility.find(v => v.userId === user.id)
          return (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
              <div>
                <div className="font-medium" style={{ color: colorScheme.text }}>
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm" style={{ color: colorScheme.textSecondary }}>
                  {user.role}
                </div>
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userVisibility?.canView || false}
                    onChange={(e) => updateVisibility(user.id, 'canView', e.target.checked)}
                  />
                  <span className="text-sm" style={{ color: colorScheme.text }}>View</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userVisibility?.canEdit || false}
                    onChange={(e) => updateVisibility(user.id, 'canEdit', e.target.checked)}
                  />
                  <span className="text-sm" style={{ color: colorScheme.text }}>Edit</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={userVisibility?.canDelete || false}
                    onChange={(e) => updateVisibility(user.id, 'canDelete', e.target.checked)}
                  />
                  <span className="text-sm" style={{ color: colorScheme.text }}>Delete</span>
                </label>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 px-4 rounded-lg font-medium"
          style={{ 
            backgroundColor: colorScheme.primary, 
            color: 'white' 
          }}
        >
          Save Visibility
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg border font-medium"
          style={{ 
            backgroundColor: 'transparent', 
            borderColor: colorScheme.border,
            color: colorScheme.text
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// File Preview Component
function FilePreview({ file, colorScheme }: { file: Report, colorScheme: any }) {
  const [previewError, setPreviewError] = useState(false)

  const renderPreview = () => {
    if (previewError) {
      return (
        <div className="p-8 text-center" style={{ backgroundColor: colorScheme.background }}>
          <File className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
          <p style={{ color: colorScheme.text }}>Preview not available</p>
          <p className="text-sm mt-2" style={{ color: colorScheme.textSecondary }}>
            {file.fileName}
          </p>
        </div>
      )
    }

    if (file.fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center p-4" style={{ backgroundColor: colorScheme.background }}>
          <img
            src={file.fileUrl}
            alt={file.title}
            className="max-w-full max-h-[60vh] object-contain rounded"
            onError={() => setPreviewError(true)}
          />
        </div>
      )
    }

    if (file.fileType.startsWith('video/')) {
      return (
        <div className="p-4" style={{ backgroundColor: colorScheme.background }}>
          <video
            controls
            className="w-full max-h-[60vh] rounded"
            onError={() => setPreviewError(true)}
          >
            <source src={file.fileUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (file.fileType.startsWith('audio/')) {
      return (
        <div className="p-8 text-center" style={{ backgroundColor: colorScheme.background }}>
          <audio
            controls
            className="w-full max-w-md mx-auto"
            onError={() => setPreviewError(true)}
          >
            <source src={file.fileUrl} type={file.fileType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )
    }

    if (file.fileType === 'application/pdf') {
      return (
        <div className="w-full h-full overflow-auto" style={{ backgroundColor: colorScheme.background }}>
          <div className="w-full h-full">
            <iframe
              src={`${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width&view=FitH`}
              className="border-0"
              style={{ 
                width: '100%',
                height: '100%',
                minHeight: '600px',
                transform: 'scale(0.9)',
                transformOrigin: 'top left'
              }}
              onError={() => setPreviewError(true)}
            />
          </div>
        </div>
      )
    }

    if (file.fileType.includes('text/') || file.fileType.includes('document') || file.fileType.includes('word')) {
      return (
        <div className="p-8 text-center" style={{ backgroundColor: colorScheme.background }}>
          <File className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
          <p style={{ color: colorScheme.text }}>Document Preview</p>
          <p className="text-sm mt-2" style={{ color: colorScheme.textSecondary }}>
            {file.fileName}
          </p>
          <p className="text-xs mt-1" style={{ color: colorScheme.textSecondary }}>
            Click download to view this document
          </p>
        </div>
      )
    }

    // Default fallback for unsupported file types
    return (
      <div className="p-8 text-center" style={{ backgroundColor: colorScheme.background }}>
        <File className="h-16 w-16 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
        <p style={{ color: colorScheme.text }}>Preview not available for this file type</p>
        <p className="text-sm mt-2" style={{ color: colorScheme.textSecondary }}>
          {file.fileName}
        </p>
        <p className="text-xs mt-1" style={{ color: colorScheme.textSecondary }}>
          Click download to view this file
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {renderPreview()}
    </div>
  )
}
