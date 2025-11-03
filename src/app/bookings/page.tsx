'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, IndianRupee } from 'lucide-react'
import { Booking } from '@/types'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No bookings found</p>
            <Link
              href="/tests"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Book a Test
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Booking #{booking.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {booking.bookingType === 'HOME_COLLECTION' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          Home Collection
                        </span>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {booking.bookingTime || 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {booking.patientName}</p>
                    <p><span className="font-medium">Age:</span> {booking.patientAge} years</p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Lab Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium">{booking.lab?.name}</p>
                    {booking.bookingType === 'HOME_COLLECTION' ? (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {booking.address}, {booking.city}, {booking.state} - {booking.pincode}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {booking.city} (Clinic Visit)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{booking.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tests</h4>
                  <ul className="space-y-2">
                    {booking.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.test?.name}</span>
                        <span className="flex items-center font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">Total Amount: </span>
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {booking.totalAmount}
                    </span>
                  </div>
                  {booking.prescriptionUrl && (
                    <a
                      href={booking.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                    >
                      View Prescription →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
