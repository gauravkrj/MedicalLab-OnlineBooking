'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') || 'user'
  const isLab = userType === 'lab'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Lab specific fields
    labName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    labPhone: '',
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (isLab && (!formData.labName || !formData.address || !formData.city || !formData.state || !formData.pincode)) {
      setError('Please fill in all lab details')
      return
    }

    // Auto-detect coordinates for lab registration using device location
    if (isLab && !formData.latitude && !formData.longitude) {
      setDetectingLocation(true)
      
      // First try to get device location (more accurate if registering from lab itself)
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            })
          })
          
          formData.latitude = position.coords.latitude
          formData.longitude = position.coords.longitude
          setDetectingLocation(false)
        } catch (geoError) {
          console.log('Device location not available, trying address geocoding:', geoError)
          
          // Fallback to address geocoding if device location fails
          try {
            const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            )
            const data = await response.json()
            if (data.length > 0) {
              formData.latitude = parseFloat(data[0].lat)
              formData.longitude = parseFloat(data[0].lon)
            } else {
              setError('Could not detect lab location from device or address. Please allow location access or verify your address.')
              setDetectingLocation(false)
              return
            }
          } catch (err) {
            console.error('Geocoding error:', err)
            setError('Failed to detect location. Please allow location access in your browser settings.')
            setDetectingLocation(false)
            return
          }
          setDetectingLocation(false)
        }
      } else {
        // Browser doesn't support geolocation, use address geocoding
        try {
          const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          )
          const data = await response.json()
          if (data.length > 0) {
            formData.latitude = parseFloat(data[0].lat)
            formData.longitude = parseFloat(data[0].lon)
          } else {
            setError('Could not detect lab location. Please verify your address is correct.')
            setDetectingLocation(false)
            return
          }
        } catch (err) {
          console.error('Geocoding error:', err)
          setError('Failed to detect location. Please try again or contact support.')
          setDetectingLocation(false)
          return
        }
        setDetectingLocation(false)
      }
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: isLab ? 'LAB' : 'USER',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      // Redirect to login or lab setup
      if (isLab) {
        router.push('/lab/dashboard')
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]"></div>
      
      <div className="relative max-w-2xl w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
            {isLab ? (
              <>
                <span className="text-gradient">Register Your Lab</span>
              </>
            ) : (
              <>
                <span className="text-gradient">Create an</span> <span className="text-white">Account</span>
              </>
            )}
          </h2>
          <p className="text-gray-400 text-lg">
            {isLab ? 'Join our premium healthcare network' : 'Start your premium healthcare journey'}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="glass-dark rounded-2xl p-8 premium-shadow-lg">
            {error && (
              <div className="mb-6 glass rounded-xl p-4 flex items-center border-red-500/30 bg-red-500/10">
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Phone number"
              />
            </div>

            {isLab && (
              <>
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-xl font-bold text-white mb-6">Lab Information</h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="labName" className="block text-sm font-semibold text-gray-300 mb-2">
                        Lab Name
                      </label>
                      <input
                        id="labName"
                        name="labName"
                        type="text"
                        required
                        value={formData.labName}
                        onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                        className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Lab name"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-semibold text-gray-300 mb-2">
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={2}
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                        placeholder="Full address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-semibold text-gray-300 mb-2">
                          State
                        </label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-sm font-semibold text-gray-300 mb-2">
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Pincode"
                      />
                    </div>

                    <div>
                      <label htmlFor="labPhone" className="block text-sm font-semibold text-gray-300 mb-2">
                        Lab Phone
                      </label>
                      <input
                        id="labPhone"
                        name="labPhone"
                        type="tel"
                        required
                        value={formData.labPhone}
                        onChange={(e) => setFormData({ ...formData, labPhone: e.target.value })}
                        className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        placeholder="Lab phone number"
                      />
                    </div>

                    <div className="glass rounded-xl p-4 border-blue-500/30 bg-blue-500/10">
                      <p className="text-sm text-blue-300 mb-4">
                        <strong className="text-blue-200">Location Setup:</strong> Your lab's location coordinates are required for users to find your lab within a 30km radius.
                      </p>
                      
                      {formData.latitude && formData.longitude ? (
                        <div className="mb-4">
                          <div className="glass rounded-lg p-3 border-green-500/30 bg-green-500/10 mb-3">
                            <p className="text-xs text-green-300 font-semibold mb-2">
                              ✓ Coordinates detected:
                            </p>
                            <p className="text-xs text-gray-300 font-mono">
                              Lat: {formData.latitude.toFixed(6)}, Lon: {formData.longitude.toFixed(6)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              setDetectingLocation(true)
                              setError('')
                              try {
                                if ('geolocation' in navigator) {
                                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                                      enableHighAccuracy: true,
                                      timeout: 10000,
                                      maximumAge: 0,
                                    })
                                  })
                                  setFormData({
                                    ...formData,
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                  })
                                } else {
                                  setError('Geolocation is not supported by your browser')
                                }
                              } catch (err: any) {
                                console.error('Location error:', err)
                                if (err.code === 1) {
                                  setError('Location permission denied. Please allow location access in your browser settings.')
                                } else {
                                  setError('Failed to get location. Please try again.')
                                }
                              } finally {
                                setDetectingLocation(false)
                              }
                            }}
                            disabled={detectingLocation}
                            className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                          >
                            {detectingLocation ? 'Updating...' : 'Update from device location'}
                          </button>
                        </div>
                      ) : (
                        <div className="mb-2 space-y-3">
                          <p className="text-xs text-amber-300 mb-3">
                            Click below to detect your location using your device's GPS. This is the most accurate method if you're registering from the lab location.
                          </p>
                          <div className="flex flex-col space-y-2">
                            <button
                              type="button"
                              onClick={async () => {
                                setDetectingLocation(true)
                                setError('')
                                try {
                                  if ('geolocation' in navigator) {
                                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                                      navigator.geolocation.getCurrentPosition(resolve, reject, {
                                        enableHighAccuracy: true,
                                        timeout: 10000,
                                        maximumAge: 0,
                                      })
                                    })
                                    setFormData({
                                      ...formData,
                                      latitude: position.coords.latitude,
                                      longitude: position.coords.longitude,
                                    })
                                  } else {
                                    setError('Geolocation is not supported by your browser')
                                  }
                                } catch (err: any) {
                                  console.error('Location error:', err)
                                  if (err.code === 1) {
                                    setError('Location permission denied. Please allow location access in your browser settings.')
                                  } else if (err.code === 2) {
                                    setError('Location unavailable. Please try again or use address geocoding.')
                                  } else {
                                    setError('Failed to get location. Please try again.')
                                  }
                                } finally {
                                  setDetectingLocation(false)
                                }
                              }}
                              disabled={detectingLocation}
                              className="flex items-center justify-center space-x-2 gradient-primary text-white text-sm px-4 py-2.5 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>{detectingLocation ? 'Getting location...' : 'Use My Current Location (GPS)'}</span>
                            </button>
                            
                            {formData.address && formData.city && formData.state && formData.pincode && (
                              <button
                                type="button"
                                onClick={async () => {
                                  setDetectingLocation(true)
                                  setError('')
                                  try {
                                    const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`
                                    const response = await fetch(
                                      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
                                    )
                                    const data = await response.json()
                                    if (data.length > 0) {
                                      setFormData({
                                        ...formData,
                                        latitude: parseFloat(data[0].lat),
                                        longitude: parseFloat(data[0].lon),
                                      })
                                    } else {
                                      setError('Could not detect location from address. Try using GPS location instead.')
                                    }
                                  } catch (err) {
                                    console.error('Geocoding error:', err)
                                    setError('Failed to detect location from address. Try using GPS location instead.')
                                  } finally {
                                    setDetectingLocation(false)
                                  }
                                }}
                                disabled={detectingLocation}
                                className="flex items-center justify-center space-x-2 glass text-gray-300 text-sm px-4 py-2.5 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MapPin className="w-4 h-4" />
                                <span>{detectingLocation ? 'Detecting from address...' : 'Detect from Address (Alternative)'}</span>
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            💡 <strong>Tip:</strong> Use "My Current Location" if you're registering from the lab. It's more accurate than address geocoding.
                          </p>
                        </div>
                      )}
                      
                      {detectingLocation && (
                        <p className="text-xs text-blue-400 mt-2 flex items-center">
                          <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-2"></span>
                          {formData.latitude && formData.longitude 
                            ? 'Updating location...' 
                            : 'Requesting location access... Please allow if prompted.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Confirm password"
              />
            </div>
          </div>

          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading || detectingLocation}
              className="group w-full flex items-center justify-center gradient-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {detectingLocation ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Detecting location...
                </span>
              ) : loading ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Creating account...
                </span>
              ) : (
                <>
                  {isLab ? 'Register Lab' : 'Sign up'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

