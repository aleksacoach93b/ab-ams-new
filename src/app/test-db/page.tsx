'use client'

import { useState } from 'react'

export default function TestDatabasePage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (name: string, url: string, method: string = 'GET') => {
    setLoading(true)
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.ok ? 'success' : 'error',
          data,
          statusCode: response.status
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          statusCode: 0
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setResults({})
    
    // Test 1: Environment Status
    await testEndpoint('Environment Status', '/api/env-status')
    
    // Test 2: Database Connection
    await testEndpoint('Database Connection', '/api/test-db-simple')
    
    // Test 3: Database Schema
    await testEndpoint('Database Schema', '/api/test-schema')
    
    // Test 4: Events API
    await testEndpoint('Events API', '/api/test-events-simple', 'POST')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🗄️ Database Test Suite
          </h1>

          <div className="mb-8">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Run Database Tests'}
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(results).map(([testName, result]) => (
              <div key={testName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{testName}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    result.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status === 'success' ? '✅ PASS' : '❌ FAIL'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Status Code: {result.statusCode}
                </div>
                
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {Object.keys(results).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Click "Run Database Tests" to start testing
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Current DATABASE_URL:
            </h3>
            <div className="text-sm text-blue-700 font-mono">
              postgresql://postgres.jgcjfqcswnzliwzjbtje:Teodor06022025@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
