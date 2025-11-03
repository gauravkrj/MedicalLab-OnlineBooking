'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Package, Settings } from 'lucide-react'

export default function LabDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalTests: 0,
    totalBookings: 0,
    pendingBookings: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'LAB') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.labId) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [testsRes, bookingsRes] = await Promise.all([
        fetch('/api/lab/tests'),
        fetch('/api/bookings?labId=' + session?.user?.labId),
      ])

      const tests = await testsRes.json()
      const bookings = await bookingsRes.json()

      setStats({
        totalTests: tests.length || 0,
        totalBookings: bookings.length || 0,
        pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'LAB') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Lab Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </div>
            <Link
              href="/lab/tests"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              Manage Tests →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-12 h-12 text-primary-600" />
            </div>
            <Link
              href="/lab/bookings"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              View Bookings →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <Calendar className="w-12 h-12 text-yellow-600" />
            </div>
            <Link
              href="/lab/bookings?status=PENDING"
              className="mt-4 inline-block text-yellow-600 hover:text-yellow-700 text-sm font-semibold"
            >
              Review Pending →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/lab/tests/new"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Plus className="w-6 h-6 text-primary-600" />
              <span className="font-semibold">Add New Test</span>
            </Link>
            <Link
              href="/lab/profile"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Settings className="w-6 h-6 text-primary-600" />
              <span className="font-semibold">Edit Profile</span>
            </Link>
            <Link
              href="/lab/bookings"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Calendar className="w-6 h-6 text-primary-600" />
              <span className="font-semibold">View All Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

