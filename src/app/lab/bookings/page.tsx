'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, IndianRupee, ArrowLeft } from 'lucide-react'
import { Booking } from '@/types'

function LabBookingsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'LAB') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.labId) {
      fetchBookings()
    }
  }, [session, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const url = statusFilter
        ? `/api/bookings?labId=${session?.user?.labId}&status=${statusFilter}`
        : `/api/bookings?labId=${session?.user?.labId}`
      
      const response = await fetch(url)
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBookings()
      } else {
        alert('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'SAMPLE_COLLECTED':
        return 'bg-purple-100 text-purple-800'
      case 'PROCESSING':
        return 'bg-indigo-100 text-indigo-800'
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

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'LAB') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/lab/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Bookings</h1>
          <div className="flex space-x-2">
            <Link
              href="/lab/bookings"
              className={`px-4 py-2 rounded-lg font-semibold ${
                !statusFilter
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </Link>
            <Link
              href="/lab/bookings?status=PENDING"
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusFilter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending
            </Link>
            <Link
              href="/lab/bookings?status=CONFIRMED"
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusFilter === 'CONFIRMED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Confirmed
            </Link>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
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
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Name:</span> {booking.patientName}</p>
                    <p><span className="font-medium">Age:</span> {booking.patientAge} years</p>
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

                <div className="border-t pt-4 mb-4 flex justify-between items-center">
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

                {booking.status === 'PENDING' && (
                  <div className="border-t pt-4 flex space-x-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'CONFIRMED' && (
                  <div className="border-t pt-4">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SAMPLE_COLLECTED">Sample Collected</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LabBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LabBookingsContent />
    </Suspense>
  )
}

