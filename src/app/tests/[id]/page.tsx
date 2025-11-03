'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PrescriptionUpload from '@/components/PrescriptionUpload'
import BookingForm from '@/components/BookingForm'
import { Test, Lab } from '@/types'

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [test, setTest] = useState<Test | null>(null)
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTest()
    }
  }, [params.id])

  const fetchTest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data)
        // If labId is provided in query, preselect that lab and show form
        const labId = searchParams.get('labId')
        if (labId) {
          const labRes = await fetch(`/api/labs/${labId}`)
          if (labRes.ok) {
            const labData = await labRes.json()
            setSelectedLab(labData)
            setShowBookingForm(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLabSelect = (lab: Lab) => {
    setSelectedLab(lab)
    setShowBookingForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">Test not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-black"></div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="glass rounded-2xl p-8 border border-white/10 mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Booking</h1>
          {selectedLab ? (
            <BookingForm
              lab={selectedLab}
              test={test}
              onCancel={() => {
                setShowBookingForm(false)
                setSelectedLab(null)
              }}
            />
          ) : (
            <div className="text-center text-gray-300">This booking requires a lab. Please open this page from a lab-specific test.</div>
          )}
        </div>

        {/* Removed duplicate booking block */}
      </div>
    </div>
  )
}
