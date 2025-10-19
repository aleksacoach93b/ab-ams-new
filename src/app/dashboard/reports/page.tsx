'use client'

import React, { useState, useEffect } from 'react'
import { 
  FolderPlus, 
  Upload, 
  FolderOpen, 
  File, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  MoreVertical,
  Download,
  Share2,
  Settings,
  EyeIcon,
  Check,
  Pencil,
  Users,
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
  visibleToStaff: {
    id: string
    canView: boolean
    staff: {
      id: string
      name: string
      email: string
    }
  }[]
  _count: {
    reports: number
    children: number
  }
}

interface Report {
  id: string
  name: string
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
}

interface StaffMember {
  id: string
  name: string
  email: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function ReportsPage() {
  const { colorScheme } = useTheme()
  const { user } = useAuth()
  const [folders, setFolders] = useState<ReportFolder[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [staffPermissions, setStaffPermissions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState<ReportFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<ReportFolder | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUploadReport, setShowUploadReport] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
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
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const [foldersResponse, staffResponse] = await Promise.all([
        fetch('/api/reports/folders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/reports/staff', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json()
        setFolders(foldersData)
      }

      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        setStaff(staffData.staff)
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
      // Clear reports first to avoid showing old data
      setReports([])
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      // If folderId is provided, fetch reports for that folder
      // If no folderId, fetch root level reports (no folder assigned)
      const url = folderId 
        ? `/api/reports?folderId=${folderId}`
        : `/api/reports`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      } else {
        console.error('Failed to fetch reports:', response.status, response.statusText)
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
      console.log('Creating folder:', { name, description })

      const response = await fetch('/api/reports/route-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description
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

  const handleUploadReport = async (name: string, description: string, file: File) => {
    try {
      console.log('=== UPLOAD REPORT DEBUG ===')
      console.log('Upload data:', { name, description, file: file.name, folderId: selectedFolder?.id })
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        alert('No authentication token found')
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('folderId', selectedFolder?.id || 'null')
      formData.append('file', file)

      console.log('Sending request to /api/reports...')
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        console.log('Upload successful!')
        await fetchReports(selectedFolder?.id)
        setShowUploadReport(false)
        alert('Report uploaded successfully!')
      } else {
        console.log('Upload failed with status:', response.status)
        let errorData
        try {
          errorData = await response.json()
          console.error('Upload failed:', errorData)
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorData = { message: `Server error (${response.status})` }
        }
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading report:', error)
      alert(`Error uploading report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/reports/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const handleRenameFolder = async (folderId: string, newName: string, newDescription?: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/reports/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: newName,
          description: newDescription
        })
      })

      if (response.ok) {
        await fetchData()
        setShowRenameModal(false)
        setSelectedItem(null)
      } else {
        const errorData = await response.json()
        console.error('Error renaming folder:', errorData.message)
        alert(`Failed to rename folder: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error renaming folder:', error)
      alert('Error renaming folder')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      await fetch('/api/analytics/file-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  // Check permissions - explicitly block players
  const hasReportsPermission = user?.role !== 'PLAYER' && (
    user?.role === 'ADMIN' || 
    user?.role === 'COACH' || 
    (user?.role === 'STAFF' && staffPermissions?.canViewReports)
  )

  if (!hasReportsPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
        <div className="text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: colorScheme.text }}>Access Denied</h1>
          <p style={{ color: colorScheme.textSecondary }}>
            {user?.role === 'PLAYER' 
              ? 'Players are not allowed to access reports.' 
              : 'You don\'t have permission to view reports.'
            }
          </p>
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
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: colorScheme.textSecondary }}
                  title="Edit visibility"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(folder)
                    setShowRenameModal(true)
                  }}
                  className="p-1 rounded hover:bg-blue-100 transition-colors text-blue-600"
                  title="Rename folder"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                  className="p-1 rounded hover:bg-red-100 transition-colors text-red-600"
                  title="Delete folder"
                >
                  <Trash2 className="h-4 w-4" />
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
            
            {/* Staff Access Info - Same as Notes */}
            {folder.visibleToStaff && folder.visibleToStaff.length > 0 && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: colorScheme.border }}>
                <p className="text-xs font-medium mb-2" style={{ color: colorScheme.textSecondary }}>
                  Visible to staff:
                </p>
                <div className="flex flex-wrap gap-1">
                  {folder.visibleToStaff
                    .filter(access => access.canView)
                    .map((access) => (
                      <span
                        key={access.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {access.staff?.name || access.staff?.email || 'Unknown Staff'}
                      </span>
                    ))}
                </div>
              </div>
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
              {report.fileType === 'application/pdf' ? (
                <div className="w-12 h-16 rounded border overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                  {report.thumbnailUrl ? (
                    <img
                      src={report.thumbnailUrl}
                      alt={report.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to PDF icon if thumbnail fails to load
                        e.currentTarget.style.display = 'none'
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                        if (nextElement) {
                          nextElement.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex flex-col items-center justify-center" style={{ display: report.thumbnailUrl ? 'none' : 'flex' }}>
                    <span className="text-lg font-bold text-red-600">PDF</span>
                    <span className="text-xs text-gray-600">📄</span>
                  </div>
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
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-1 rounded hover:bg-red-100 transition-colors text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold mb-1" style={{ color: colorScheme.text }}>
              {report.name}
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
              staff={staff}
              onCancel={() => {
                setShowVisibilityModal(false)
                setSelectedItem(null)
              }}
              onSuccess={async () => {
                await fetchData()
                await fetchReports()
              }}
              colorScheme={colorScheme}
            />
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg max-w-lg w-full mx-4"
            style={{ backgroundColor: colorScheme.surface }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.text }}>
              Rename Folder
            </h2>
            <RenameFolderForm
              folder={selectedItem}
              onSubmit={(newName: string, newDescription?: string) => {
                handleRenameFolder(selectedItem.id, newName, newDescription)
              }}
              onCancel={() => {
                setShowRenameModal(false)
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
                {previewFile.name}
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
          disabled={!name.trim()}
          className="flex-1 py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== FORM SUBMIT DEBUG ===')
    console.log('Form data:', { name: name.trim(), description: description.trim(), file: file?.name })
    
    if (name.trim() && file) {
      console.log('Calling onSubmit...')
      onSubmit(name.trim(), description.trim() || undefined, file)
    } else {
      console.log('Form validation failed:', { hasName: !!name.trim(), hasFile: !!file })
      alert('Please fill in the report name and select a file')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colorScheme.text }}>
          Report Name
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
            alt={file.name}
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
              src={`${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit&view=FitV`}
              className="border-0"
              style={{ 
                width: '100%',
                height: '100%',
                minHeight: '600px'
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

// Visibility Manager Component - Same approach as Notes system
function VisibilityManager({ item, staff, onCancel, onSuccess, colorScheme }: any) {
  const [selectedStaff, setSelectedStaff] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    // Initialize with all staff unchecked
    const initialSelection: {[key: string]: boolean} = {}
    staff.forEach((staffMember: any) => {
      initialSelection[staffMember.id] = false
    })
    setSelectedStaff(initialSelection)
  }, [staff])

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      // Create staff access array from selected staff (same as Notes system)
      const staffAccess = Object.entries(selectedStaff)
        .filter(([staffId, canView]) => canView) // Only include selected staff
        .map(([staffId, canView]) => ({
          staffId,
          canView
        }))

      console.log('=== FRONTEND DEBUG ===')
      console.log('Selected staff:', selectedStaff)
      console.log('Staff access data being sent:', staffAccess)
      console.log('Staff array:', staff)

      const endpoint = `/api/reports/folders/${item.id}`
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: item.name,
          description: item.description,
          staffAccess: staffAccess
        })
      })

      if (response.ok) {
        onCancel()
        // Refresh data to show updated visibility without page reload
        if (onSuccess) {
          await onSuccess()
        }
      } else {
        const errorData = await response.json()
        console.error('Error updating visibility:', errorData.message)
        alert(`Failed to update visibility: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
      alert('Error updating visibility')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: colorScheme.text }}>
        Staff Access Control
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {staff.map((staffMember: any) => (
          <div key={staffMember.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`staff-${staffMember.id}`}
              checked={selectedStaff[staffMember.id] || false}
              onChange={(e) => {
                setSelectedStaff(prev => ({
                  ...prev,
                  [staffMember.id]: e.target.checked
                }))
              }}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label 
              htmlFor={`staff-${staffMember.id}`}
              className="text-sm font-medium"
              style={{ color: colorScheme.text }}
            >
              {staffMember.name || staffMember.email}
            </label>
          </div>
        ))}
      </div>
      {staff.length === 0 && (
        <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
          No staff members found
        </p>
      )}
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

// Rename Folder Form Component
function RenameFolderForm({ folder, onSubmit, onCancel, colorScheme }: any) {
  const [name, setName] = useState(folder.name || '')
  const [description, setDescription] = useState(folder.description || '')

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
          className="w-full p-3 rounded-lg border resize-none"
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
          Rename Folder
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
