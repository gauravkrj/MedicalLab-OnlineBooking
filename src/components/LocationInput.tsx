'use client'

import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'

interface LocationInputProps {
  location: {
    city: string
    pincode: string
    latitude: string
    longitude: string
  }
  onChange: (location: {
    city: string
    pincode: string
    latitude: string
    longitude: string
  }) => void
  onSubmit: () => void
}

export default function LocationInput({ location, onChange, onSubmit }: LocationInputProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            ...location,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          })
          setUseCurrentLocation(true)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enter manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            placeholder="Enter city"
            value={location.city}
            onChange={(e) => onChange({ ...location, city: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pincode
          </label>
          <input
            type="text"
            placeholder="Enter pincode"
            value={location.pincode}
            onChange={(e) => onChange({ ...location, pincode: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use Current Location
        </button>
        {useCurrentLocation && (
          <span className="text-sm text-green-300">✓ Location detected</span>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!location.city && !location.pincode && !location.latitude}
        className="w-full md:w-auto gradient-primary text-white px-6 py-3 rounded-xl hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Search className="w-4 h-4 mr-2" />
        Find Labs
      </button>
    </div>
  )
}
