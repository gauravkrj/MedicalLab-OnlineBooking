'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, MapPin, AlertCircle } from 'lucide-react'
import TestCard from '@/components/TestCard'
import { Test } from '@/types'
import { useLocation } from '@/hooks/useLocation'

export default function TestsPage() {
  const { data: session } = useSession()
  const { location, locationError, locationLoading } = useLocation()
  const [tests, setTests] = useState<Test[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for location if user is signed in
    if (session && locationLoading) {
      return
    }
    fetchTests()
  }, [session, location, locationLoading])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      
      // Add location if available (for signed-in users)
      if (session && location.latitude && location.longitude) {
        params.append('latitude', location.latitude.toString())
        params.append('longitude', location.longitude.toString())
        params.append('radius', '30') // 30km radius
      }

      const response = await fetch(`/api/tests?${params.toString()}`)
      const data = await response.json()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTests()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedCategory, location])

  const categories = ['all', ...Array.from(new Set(tests.map(t => t.category)))]

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3">
              <span className="text-gradient">All Medical</span> <span className="text-white">Tests</span>
            </h1>
            <p className="text-gray-400 text-lg">Browse our complete catalog of medical tests</p>
          </div>
          {session && location.latitude && location.longitude && (
            <div className="mt-4 sm:mt-0 flex items-center text-sm glass rounded-xl px-4 py-2.5 border-green-500/30 bg-green-500/10">
              <MapPin className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-green-300">Within 30km radius</span>
            </div>
          )}
        </div>

        {session && locationError && (
          <div className="mb-6 glass rounded-xl p-4 flex items-center border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
            <p className="text-yellow-300 text-sm">{locationError}</p>
          </div>
        )}

        {session && locationLoading && (
          <div className="mb-6 glass rounded-xl p-4 text-center border-blue-500/30 bg-blue-500/10">
            <p className="text-blue-300 text-sm">Detecting your location to show nearby labs...</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-12 space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-3.5 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-gray-900">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block glass rounded-2xl p-8">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tests...</p>
            </div>
          </div>
        )}

        {/* Tests Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )}

        {!loading && tests.length === 0 && (
          <div className="text-center py-20">
            <div className="glass rounded-2xl p-12 inline-block">
              <p className="text-gray-400 text-lg">No tests found. Try a different search.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
