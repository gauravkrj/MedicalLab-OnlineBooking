'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, MapPin, Phone } from 'lucide-react'

interface Lab {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string | null
  isActive: boolean
  isVerified: boolean
  user: {
    id: string
    email: string
    name: string | null
  }
}

export default function AdminLabsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchLabs()
    }
  }, [session, statusFilter])

  const fetchLabs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/labs')
      const data = await response.json()
      
      let filteredLabs = data
      if (statusFilter === 'pending') {
        filteredLabs = data.filter((lab: Lab) => !lab.isVerified)
      }
      
      setLabs(filteredLabs)
    } catch (error) {
      console.error('Error fetching labs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLabStatus = async (labId: string, field: 'isVerified' | 'isActive', value: boolean) => {
    try {
      const response = await fetch(`/api/admin/labs/${labId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        fetchLabs()
      } else {
        alert('Failed to update lab status')
      }
    } catch (error) {
      console.error('Error updating lab:', error)
      alert('Failed to update lab status')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Manage Labs</h1>
          <div className="flex space-x-2">
            <Link
              href="/admin/labs"
              className={`px-4 py-2 rounded-lg font-semibold ${
                !statusFilter
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Labs
            </Link>
            <Link
              href="/admin/labs?status=pending"
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending Verification
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {labs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No labs found</p>
            </div>
          ) : (
            labs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{lab.name}</h3>
                      {lab.isVerified ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                          Pending
                        </span>
                      )}
                      {!lab.isActive && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {lab.address}, {lab.city}, {lab.state} - {lab.pincode}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{lab.phone}</span>
                      </div>
                      <p><span className="font-medium">Owner:</span> {lab.user.name || lab.user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex space-x-2">
                  {!lab.isVerified && (
                    <button
                      onClick={() => updateLabStatus(lab.id, 'isVerified', true)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Verify Lab</span>
                    </button>
                  )}
                  <button
                    onClick={() => updateLabStatus(lab.id, 'isActive', !lab.isActive)}
                    className={`flex-1 py-2 rounded-lg transition font-semibold ${
                      lab.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {lab.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

