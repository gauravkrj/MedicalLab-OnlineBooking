'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Search, MapPin, Clock, Upload, ArrowRight, AlertCircle } from 'lucide-react'
import TestCard from '@/components/TestCard'
import Link from 'next/link'
import { Test } from '@/types'
import { useLocation } from '@/hooks/useLocation'

export default function HomePage() {
  const { data: session } = useSession()
  const { location, locationError, locationLoading } = useLocation()
          const [tests, setTests] = useState<Test[]>([])
          const [labs, setLabs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Wait for location if user is signed in
    if (session && locationLoading) {
      return
    }
    fetchTests()
          }, [session, location, locationLoading])

          const fetchTests = async () => {
    try {
      const params = new URLSearchParams()
      
      // Add location if available (for signed-in users)
      if (session && location.latitude && location.longitude) {
        params.append('latitude', location.latitude.toString())
        params.append('longitude', location.longitude.toString())
        params.append('radius', '30') // 30km radius
      }

      const response = await fetch(`/api/tests?${params.toString()}`)
      const data = await response.json()
      // Guard against non-array responses (e.g., error objects)
      const testsArray = Array.isArray(data) ? data : (Array.isArray((data as any)?.tests) ? (data as any).tests : [])
      setTests(testsArray)
              // Also fetch labs within radius for second section
              if (session && location.latitude && location.longitude) {
                const labParams = new URLSearchParams()
                labParams.append('latitude', location.latitude.toString())
                labParams.append('longitude', location.longitude.toString())
                const labsRes = await fetch(`/api/labs?${labParams.toString()}`)
                if (labsRes.ok) {
                  const labsData = await labsRes.json()
                  const labsArray = Array.isArray(labsData) ? labsData : (Array.isArray((labsData as any)?.labs) ? (labsData as any).labs : [])
                  setLabs(labsArray)
                } else {
                  setLabs([])
                }
              }
    } catch (error) {
      console.error('Error fetching tests:', error)
    }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory
    return matchesSearch && matchesCategory && test.isActive
  })

  const categories = ['all', ...Array.from(new Set(tests.map(t => t.category)))]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 glass rounded-full text-sm text-blue-300 font-medium">
              <span className="animate-pulse">✨</span> Premium Healthcare Services
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gradient">Book Your Medical</span>
              <br />
              <span className="text-white">Tests Online</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-2xl mx-auto">
              Find labs near you, upload prescriptions, and book appointments instantly with our premium healthcare platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/tests"
                className="group inline-flex items-center gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Browse Tests <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/labs"
                className="inline-flex items-center glass text-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Find Labs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Why Choose</span> <span className="text-white">MedLab?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience premium healthcare services with cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group glass rounded-2xl p-8 text-center hover-lift premium-shadow hover:border-blue-500/50 transition-all duration-300">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg glow group-hover:scale-110 transition-transform duration-300">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Search Tests</h3>
              <p className="text-gray-400 leading-relaxed">Browse through hundreds of medical tests with advanced filtering</p>
            </div>
            <div className="group glass rounded-2xl p-8 text-center hover-lift premium-shadow hover:border-purple-500/50 transition-all duration-300">
              <div className="w-20 h-20 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg glow-purple group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Find Labs</h3>
              <p className="text-gray-400 leading-relaxed">Locate labs near your location with 30km radius precision</p>
            </div>
            <div className="group glass rounded-2xl p-8 text-center hover-lift premium-shadow hover:border-indigo-500/50 transition-all duration-300">
              <div className="w-20 h-20 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Upload Prescription</h3>
              <p className="text-gray-400 leading-relaxed">Share your prescription or documents securely</p>
            </div>
          </div>
        </div>
      </section>

              {/* Tests within radius */}
              <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-2">
                        <span className="text-gradient">Tests</span> <span className="text-white">near you</span>
              </h2>
                      <p className="text-gray-400">All medical tests within your 30km radius</p>
            </div>
            <Link 
              href="/tests" 
                      className="mt-4 sm:mt-0 flex items-center text-emerald-400 hover:text-emerald-300 font-semibold group transition-colors"
            >
              View All <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {session && location.latitude && location.longitude && (
            <div className="mb-6 flex items-center text-sm glass rounded-lg px-4 py-2.5 inline-block border-green-500/30 bg-green-500/10">
              <MapPin className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-green-300">Showing tests from labs within 30km radius</span>
            </div>
          )}

          {session && locationError && (
            <div className="mb-6 glass rounded-lg p-4 flex items-center border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
              <p className="text-yellow-300 text-sm">{locationError}</p>
            </div>
          )}

          {session && locationLoading && (
            <div className="mb-6 glass rounded-lg p-4 text-center border-blue-500/30 bg-blue-500/10">
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

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.slice(0, 6).map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-16">
              <div className="glass rounded-2xl p-12 inline-block">
                <p className="text-gray-400 text-lg">No tests found. Try a different search.</p>
              </div>
            </div>
          )}
        </div>
      </section>

              {/* Labs within radius */}
              <section className="py-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-gradient">Labs</span> <span className="text-white">near you</span>
                      </h2>
                      <p className="text-gray-400">All labs within your 30km radius</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labs.slice(0, 6).map((lab) => (
                      <div key={lab.id} className="glass rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-2">{lab.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{lab.address}, {lab.city}, {lab.state} - {lab.pincode}</p>
                        {lab.distance !== undefined && (
                          <p className="text-emerald-300 text-sm mb-4">{lab.distance?.toFixed(1)} km away</p>
                        )}
                        <Link href="/tests" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-semibold">
                          View tests <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-dark rounded-3xl p-12 md:p-16 premium-shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Ready to Book</span> <span className="text-white">Your Test?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Get started by selecting tests and finding a lab near you with our premium booking system
            </p>
            <Link
              href="/tests"
              className="inline-flex items-center gradient-primary text-white px-10 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
