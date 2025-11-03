'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin } from 'lucide-react'
import LocationInput from '@/components/LocationInput'
import LabCard from '@/components/LabCard'
import { Lab, Test } from '@/types'

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [location, setLocation] = useState({ city: '', pincode: '', latitude: '', longitude: '' })
  const [loading, setLoading] = useState(false)

  const handleLocationSubmit = async () => {
    if (!location.city && !location.pincode && !location.latitude) return

    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      if (location.city) searchParams.append('city', location.city)
      if (location.pincode) searchParams.append('pincode', location.pincode)
      if (location.latitude) searchParams.append('latitude', location.latitude)
      if (location.longitude) searchParams.append('longitude', location.longitude)

      const response = await fetch(`/api/labs?${searchParams.toString()}`)
      const data = await response.json()
      setLabs(data)
    } catch (error) {
      console.error('Error fetching labs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock test for LabCard - in a real app, you'd have test selection
  const mockTest: Test = {
    id: 'mock',
    name: 'Test',
    category: 'General',
    price: 0,
    isActive: true,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8"><span className="text-gradient">Find</span> Labs Near You</h1>

        <div className="glass-dark rounded-2xl p-8 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
            Enter Your Location
          </h2>
          <LocationInput
            location={location}
            onChange={setLocation}
            onSubmit={handleLocationSubmit}
          />
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Searching for labs...</p>
          </div>
        )}

        {!loading && labs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Found {labs.length} Lab{labs.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div key={lab.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all">
                  <h3 className="text-xl font-semibold text-white mb-2">{lab.name}</h3>
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-400" />
                      <span>
                        {lab.address}, {lab.city}, {lab.state} - {lab.pincode}
                      </span>
                    </div>
                    <p className="font-medium text-gray-300">{lab.phone}</p>
                    {lab.distance !== undefined && (
                      <div className="text-emerald-300 font-semibold">
                        {lab.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                  <Link
                    href="/tests"
                    className="block w-full gradient-primary text-white text-center py-2.5 rounded-lg transition font-semibold"
                  >
                    View Available Tests
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && labs.length === 0 && location.city && (
          <div className="glass-dark rounded-2xl p-12 text-center border border-white/10">
            <p className="text-gray-400 text-lg">No labs found in this location. Try a different city or pincode.</p>
          </div>
        )}

        {!loading && !location.city && !location.pincode && !location.latitude && (
          <div className="glass-dark rounded-2xl p-12 text-center border border-white/10">
            <p className="text-gray-400 text-lg">Enter your location to find labs near you.</p>
          </div>
        )}
      </div>
    </div>
  )
}
