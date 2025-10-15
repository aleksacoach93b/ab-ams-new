'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Palette, Check } from 'lucide-react'

const themes = [
  { name: 'Light', value: 'light', color: '#F3F4F6' },
  { name: 'Dark', value: 'dark', color: '#1F2937' },
  { name: 'Blue', value: 'blue', color: '#1E40AF' },
  { name: 'Green', value: 'green', color: '#059669' },
  { name: 'Purple', value: 'purple', color: '#7C3AED' },
]

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Change theme"
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme selector */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                Choose Theme
              </div>
              
              <div className="py-1">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value as any)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: themeOption.color }}
                      />
                      <span>{themeOption.name}</span>
                    </div>
                    
                    {theme === themeOption.value && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
