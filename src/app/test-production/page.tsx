'use client'

import { useState } from 'react'

export default function TestProductionPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTest = async (testName: string, endpoint: string, method: string = 'GET') => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          status: response.ok ? 'success' : 'error',
          data,
          statusCode: response.status
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: {
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
    
    // Test 1: Environment Variables
    await runTest('Environment Variables', '/api/test-env')
    
    // Test 2: Database Connection
    await runTest('Database Connection', '/api/test-db-connection')
    
    // Test 3: Login
    await runTest('Login Test', '/api/test-login-simple', 'POST')
    
    // Test 4: Create Event
    await runTest('Create Event', '/api/test-create-event', 'POST')
    
    // Test 5: Create Player
    await runTest('Create Player', '/api/test-create-player', 'POST')
    
    // Test 6: Create Staff
    await runTest('Create Staff', '/api/test-create-staff', 'POST')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Production Test Suite
          </h1>

          <div className="mb-8">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
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
                
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {Object.keys(results).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Click "Run All Tests" to start testing
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
