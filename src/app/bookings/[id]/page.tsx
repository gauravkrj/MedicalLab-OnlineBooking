'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Phone, IndianRupee, ArrowLeft } from 'lucide-react'
import { Booking } from '@/types'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBooking()
    }
  }, [params.id])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
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
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Booking not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/bookings"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Bookings
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking #{booking.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600">Created on {formatDate(booking.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>

          {/* Patient Information */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="font-semibold text-gray-900">{booking.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-semibold text-gray-900">{booking.patientAge} years</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {booking.bookingType === 'HOME_COLLECTION' ? 'Collection Details' : 'Appointment Details'}
            </h2>
            {booking.bookingType === 'HOME_COLLECTION' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Home Collection - Sample will be collected from your address</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">{booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold">{booking.bookingTime || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lab Information */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lab Information</h2>
            <div className="space-y-3">
              <p className="font-semibold text-lg">{booking.lab?.name}</p>
              <div className="flex items-start text-gray-700">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary-600 flex-shrink-0" />
                <div>
                  {booking.bookingType === 'HOME_COLLECTION' ? (
                    <>
                      <p>{booking.address}</p>
                      <p>{booking.city}, {booking.state} - {booking.pincode}</p>
                    </>
                  ) : (
                    <p>{booking.city} (Visit at clinic)</p>
                  )}
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" />
                <span>{booking.phone}</span>
              </div>
            </div>
          </div>

          {/* Tests */}
          <div className="border-t pt-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tests Booked</h2>
            <div className="space-y-3">
              {booking.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-semibold">{item.test?.name}</p>
                    {item.test?.description && (
                      <p className="text-sm text-gray-600">{item.test.description}</p>
                    )}
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <IndianRupee className="w-5 h-5" />
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription */}
          {booking.prescriptionUrl && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prescription</h2>
              <a
                href={booking.prescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
              >
                View Prescription →
              </a>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="border-t pt-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Additional Notes</h2>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-900">Total Amount</span>
              <div className="flex items-center text-2xl font-bold text-gray-900">
                <IndianRupee className="w-6 h-6" />
                {booking.totalAmount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
