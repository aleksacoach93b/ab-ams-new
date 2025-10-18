'use client'

import { useState, useEffect } from 'react'

export default function SetupEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEnvStatus()
  }, [])

  const checkEnvStatus = async () => {
    try {
      const response = await fetch('/api/setup-env')
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      setEnvStatus({
        status: 'error',
        message: 'Failed to check environment status'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking environment setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🚀 AB-AMS Environment Setup
          </h1>

          {envStatus?.status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ✅ All Environment Variables Are Set!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your application is ready to use. You can now:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Go to the <a href="/login" className="underline">login page</a></li>
                      <li>Login with admin credentials</li>
                      <li>Start using the application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ⚠️ Environment Variables Missing
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You need to add environment variables to Vercel:</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Required Environment Variables
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">DATABASE_URL</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.DATABASE_URL === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.DATABASE_URL || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">JWT_SECRET</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.JWT_SECRET === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.JWT_SECRET || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">NEXTAUTH_SECRET</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.NEXTAUTH_SECRET === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.NEXTAUTH_SECRET || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">NEXTAUTH_URL</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.NEXTAUTH_URL === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.NEXTAUTH_URL || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">NEXT_PUBLIC_APP_URL</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.NEXT_PUBLIC_APP_URL === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.NEXT_PUBLIC_APP_URL || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">NEXT_PUBLIC_APP_NAME</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      envStatus?.envVars?.NEXT_PUBLIC_APP_NAME === 'Set' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envStatus?.envVars?.NEXT_PUBLIC_APP_NAME || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {envStatus?.status === 'missing_env_vars' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  🔧 Setup Instructions
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <ol className="list-decimal list-inside space-y-3 text-sm">
                    <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Vercel Dashboard</a></li>
                    <li>Login with your account: <strong>aleksacoach@gmail.com</strong></li>
                    <li>Find your project: <strong>ultrax-wellness-app</strong></li>
                    <li>Click on the project → Go to <strong>"Settings"</strong> tab</li>
                    <li>Click on <strong>"Environment Variables"</strong></li>
                    <li>Add the following variables:</li>
                  </ol>
                  
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs">
{`DATABASE_URL = postgresql://postgres:Teodor06022025@db.jgcjfqcswnzliwzjbtje.supabase.co:5432/postgres
JWT_SECRET = ab-ams-super-secret-jwt-key-2024-production
NEXTAUTH_SECRET = ab-ams-nextauth-secret-2024-production
NEXTAUTH_URL = https://ab-ams.vercel.app
NEXT_PUBLIC_APP_URL = https://ab-ams.vercel.app
NEXT_PUBLIC_APP_NAME = AB - AMS`}
                    </pre>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-blue-700">
                      <strong>Important:</strong> Make sure to set all variables for <strong>Production</strong>, <strong>Preview</strong>, and <strong>Development</strong> environments.
                    </p>
                  </div>
                  
                  <ol className="list-decimal list-inside space-y-3 text-sm mt-4" start="7">
                    <li>After adding all variables, go to <strong>"Deployments"</strong> tab</li>
                    <li>Click <strong>"Redeploy"</strong> on the latest deployment</li>
                    <li>Wait for the deployment to complete</li>
                    <li>Refresh this page to check the status</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={checkEnvStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Status
              </button>
              
              {envStatus?.status === 'success' && (
                <a
                  href="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  🚀 Go to Login
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
