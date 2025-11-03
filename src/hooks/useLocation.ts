'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Location {
  latitude: number | null
  longitude: number | null
  city?: string
  pincode?: string
}

export function useLocation() {
  const { data: session } = useSession()
  const [location, setLocation] = useState<Location>({ latitude: null, longitude: null })
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)

  useEffect(() => {
    // Only request location if user is signed in
    if (!session) {
      setLocationLoading(false)
      return
    }

    // Check if location is already stored
    const storedLocation = localStorage.getItem('userLocation')
    if (storedLocation) {
      try {
        const parsed = JSON.parse(storedLocation)
        setLocation(parsed)
        setLocationLoading(false)
        return
      } catch (e) {
        // Invalid stored data, continue to request
      }
    }

    // Request geolocation permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }

          // Try to get city from reverse geocoding (optional)
          try {
            // Using a simple reverse geocoding (you might want to use a proper API)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.latitude}&lon=${newLocation.longitude}`
            )
            const data = await response.json()
            if (data.address) {
              newLocation.city = data.address.city || data.address.town || data.address.village
              newLocation.pincode = data.address.postcode
            }
          } catch (e) {
            console.log('Reverse geocoding failed, using coordinates only')
          }

          setLocation(newLocation)
          localStorage.setItem('userLocation', JSON.stringify(newLocation))
          setLocationLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Unable to get your location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timeout.'
              break
          }
          
          setLocationError(errorMessage)
          setLocationLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
    }
  }, [session])

  return { location, locationError, locationLoading }
}

