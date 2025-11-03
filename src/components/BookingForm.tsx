'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lab, Test, TestType, BookingType } from '@/types'
import { Calendar, Clock, IndianRupee, Home, Building2 } from 'lucide-react'
import PrescriptionUpload from '@/components/PrescriptionUpload'

interface BookingFormProps {
  lab: Lab
  test: Test
  prescriptionUrl?: string | null
  onCancel: () => void
}

export default function BookingForm({ lab, test, prescriptionUrl, onCancel }: BookingFormProps) {
  const router = useRouter()
  const isHomeTest = test.testType === TestType.HOME_TEST
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    bookingDate: isHomeTest ? '' : '',
    bookingTime: isHomeTest ? '' : '',
    address: isHomeTest ? '' : '',
    city: isHomeTest ? '' : (lab.city || ''),
    state: isHomeTest ? '' : (lab.state || ''),
    pincode: isHomeTest ? '' : (lab.pincode || ''),
    phone: '',
  })
  const [internalPrescriptionUrl, setInternalPrescriptionUrl] = useState<string | null>(prescriptionUrl ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingNotes, setBookingNotes] = useState('')

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate prescription for home tests
    if (isHomeTest && !internalPrescriptionUrl) {
      alert('Prescription is required for home collection tests')
      return
    }

    setSubmitting(true)

    try {
      const bookingData = {
        labId: lab.id,
        testId: test.id,
        bookingType: isHomeTest ? BookingType.HOME_COLLECTION : BookingType.CLINIC_VISIT,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        bookingDate: isHomeTest ? null : formData.bookingDate,
        bookingTime: isHomeTest ? null : formData.bookingTime,
        address: isHomeTest ? formData.address : undefined,
        city: formData.city,
        state: isHomeTest ? formData.state : lab.state,
        pincode: isHomeTest ? formData.pincode : undefined,
        phone: formData.phone,
        notes: bookingNotes,
        prescriptionUrl: isHomeTest ? internalPrescriptionUrl : (internalPrescriptionUrl || undefined),
        totalAmount: test.price,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Booking failed')
      }

      const created = await response.json()
      router.push(`/bookings/${created.id}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">Complete Your Booking</h2>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border ${
            isHomeTest 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>
            {isHomeTest ? (
              <>
                <Home className="w-4 h-4" />
                <span>Home Collection</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Clinic Visit</span>
              </>
            )}
          </div>
        </div>
        <p className="text-gray-400 text-lg">Lab: <span className="text-blue-400 font-semibold">{lab.name}</span></p>
      </div>

      {/* Test Summary */}
      <div className="glass rounded-2xl p-6 premium-shadow border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4">{test.name}</h3>
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-gray-400 font-medium">Total Amount</span>
          <div className="flex items-center text-2xl font-bold">
            <IndianRupee className="w-6 h-6 mr-1 text-blue-400" />
            <span className="text-gradient">{test.price}</span>
          </div>
        </div>
        {isHomeTest && (
          <div className="mt-4 glass rounded-lg p-3 border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-300 font-medium">
              ⚠️ Prescription is required for home collection
            </p>
          </div>
        )}
      </div>

      {/* Patient Information (Single) */}
      <div className="glass rounded-2xl p-6 premium-shadow">
        <h3 className="text-lg font-bold text-white mb-6">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Patient Name *</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Patient Age *</label>
            <input
              type="number"
              required
              min="1"
              max="120"
              value={formData.patientAge}
              onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
              placeholder="Age"
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Mobile Number *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Mobile number"
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Conditional Fields Based on Test Type */}
      <div className="glass rounded-2xl p-6 premium-shadow">
        <h3 className="text-lg font-bold text-white mb-6">
          {isHomeTest ? 'Home Collection Details' : 'Appointment Details'}
        </h3>
        {isHomeTest ? (
          <>
            {/* Home Test - Full Address Required */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Complete Address *
              </label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address for home collection"
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Clinic Test - Date, Time, and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  Booking Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-purple-400" />
                  Time Slot *
                </label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="" className="bg-gray-900">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time} className="bg-gray-900">
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City where you'll visit the clinic"
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </>
        )}
      </div>

      <div className="glass rounded-2xl p-6 premium-shadow">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Additional Notes (Optional, applies to all patients)
        </label>
        <textarea
          rows={3}
          value={bookingNotes}
          onChange={(e) => setBookingNotes(e.target.value)}
          placeholder="Any special instructions or notes"
          className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
        />
      </div>

      {/* Prescription Upload (bottom) */}
      <div className="glass rounded-2xl p-6 premium-shadow">
        <h3 className="text-lg font-bold text-white mb-4">Prescription</h3>
        <PrescriptionUpload onUploadComplete={setInternalPrescriptionUrl} />
        {isHomeTest && (
          <p className="text-xs text-red-300 mt-2">Required for home collection tests</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 glass text-gray-300 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold border border-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 gradient-primary text-white py-3.5 rounded-xl hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              Booking...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </form>
  )
}
