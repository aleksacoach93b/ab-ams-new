'use client'

import { useState, useEffect } from 'react'
import { Settings, Users, Shield, Clock, MapPin, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface LoginLog {
  id: string
  userId: string
  email: string
  role: string
  firstName: string
  lastName: string
  avatar?: string
  ipAddress: string
  userAgent: string
  location?: string
  success: boolean
  failureReason?: string
  createdAt: string
}

interface LoginStats {
  totalLogins: number
  successfulLogins: number
  failedLogins: number
  uniqueUsers: number
}

const adminSections = [
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: Users,
    href: '/dashboard/admin/users',
    color: 'bg-blue-500'
  },
  {
    title: 'System Settings',
    description: 'Configure app settings and preferences',
    icon: Settings,
    href: '/dashboard/admin/settings',
    color: 'bg-gray-500'
  }
]

export default function AdminPage() {
  const { colorScheme } = useTheme()
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [loginStats, setLoginStats] = useState<LoginStats>({
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    uniqueUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoginData()
  }, [])

  const fetchLoginData = async () => {
    try {
      const response = await fetch('/api/admin/login-logs?limit=20')
      if (response.ok) {
        const data = await response.json()
        setLoginLogs(data.loginLogs)
        
        // Calculate stats
        const totalLogins = data.totalCount
        const successfulLogins = data.loginLogs.filter((log: LoginLog) => log.success).length
        const failedLogins = data.loginLogs.filter((log: LoginLog) => !log.success).length
        const uniqueUsers = new Set(data.loginLogs.map((log: LoginLog) => log.userId)).size
        
        setLoginStats({
          totalLogins,
          successfulLogins,
          failedLogins,
          uniqueUsers
        })
      }
    } catch (error) {
      console.error('Error fetching login data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const getLoginStatusColor = (success: boolean) => {
    return success ? 'bg-green-500' : 'bg-red-500'
  }

  const getLoginStatusIcon = (success: boolean) => {
    return success ? Shield : AlertTriangle
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: colorScheme.background }}>
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: colorScheme.text }}>Admin Dashboard</h1>
        <p style={{ color: colorScheme.textSecondary }}>Monitor and manage your athlete management system</p>
      </div>

      {/* Login Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg shadow p-6" style={{ backgroundColor: colorScheme.surface }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Total Logins</p>
              <p className="text-2xl font-semibold" style={{ color: colorScheme.text }}>{loginStats.totalLogins}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow p-6" style={{ backgroundColor: colorScheme.surface }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Successful</p>
              <p className="text-2xl font-semibold" style={{ color: '#10B981' }}>{loginStats.successfulLogins}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow p-6" style={{ backgroundColor: colorScheme.surface }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Failed Attempts</p>
              <p className="text-2xl font-semibold" style={{ color: '#EF4444' }}>{loginStats.failedLogins}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow p-6" style={{ backgroundColor: colorScheme.surface }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: colorScheme.textSecondary }}>Active Users</p>
              <p className="text-2xl font-semibold" style={{ color: colorScheme.text }}>{loginStats.uniqueUsers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <div className="rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: colorScheme.surface }}>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: colorScheme.text }}>{section.title}</h3>
                    <p className="text-sm" style={{ color: colorScheme.textSecondary }}>{section.description}</p>
                  </div>
                </div>
                
                <div className="w-full text-left px-4 py-2 text-sm font-medium border rounded-md transition-colors" 
                     style={{ 
                       color: colorScheme.primary, 
                       borderColor: colorScheme.primary,
                       backgroundColor: colorScheme.primary + '10'
                     }}>
                  Manage {section.title}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Login Activity Monitoring */}
      <div className="rounded-lg shadow" style={{ backgroundColor: colorScheme.surface }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: colorScheme.border }}>
          <h3 className="text-lg font-medium" style={{ color: colorScheme.text }}>🔒 Login Activity Monitoring</h3>
          <p className="text-sm mt-1" style={{ color: colorScheme.textSecondary }}>
            Real-time tracking of all login attempts and user access patterns
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colorScheme.primary }}></div>
            </div>
          ) : loginLogs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4" style={{ color: colorScheme.textSecondary }} />
              <p className="text-lg font-medium" style={{ color: colorScheme.text }}>No login activity yet</p>
              <p className="text-sm" style={{ color: colorScheme.textSecondary }}>Login attempts will appear here once users start accessing the system</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loginLogs.map((log) => {
                const StatusIcon = getLoginStatusIcon(log.success)
                return (
                  <div key={log.id} className="flex items-center space-x-4 p-4 rounded-lg border" 
                       style={{ 
                         backgroundColor: colorScheme.background,
                         borderColor: colorScheme.border 
                       }}>
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 ${getLoginStatusColor(log.success)} rounded-full`}></div>
                    </div>
                    
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {log.avatar ? (
                        <img
                          src={log.avatar}
                          alt={`${log.firstName} ${log.lastName}`}
                          className="w-10 h-10 rounded-full object-cover border-2"
                          style={{ borderColor: colorScheme.border }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white border-2"
                          style={{ 
                            backgroundColor: colorScheme.primary,
                            borderColor: colorScheme.border
                          }}
                        >
                          {log.firstName[0]}{log.lastName[0]}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium" style={{ color: colorScheme.text }}>
                          {log.firstName} {log.lastName}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                              style={{ 
                                backgroundColor: log.role === 'ADMIN' ? '#EF444420' : 
                                               log.role === 'COACH' ? '#3B82F620' : '#10B98120',
                                color: log.role === 'ADMIN' ? '#EF4444' : 
                                       log.role === 'COACH' ? '#3B82F6' : '#10B981'
                              }}>
                          {log.role}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: colorScheme.textSecondary }}>
                        {log.success ? 'Successfully logged in' : `Failed login: ${log.failureReason}`}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" style={{ color: colorScheme.textSecondary }} />
                          <span className="text-xs" style={{ color: colorScheme.textSecondary }}>{log.ipAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" style={{ color: colorScheme.textSecondary }} />
                          <span className="text-xs" style={{ color: colorScheme.textSecondary }}>{formatTimeAgo(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <StatusIcon className="h-5 w-5" style={{ color: log.success ? '#10B981' : '#EF4444' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}