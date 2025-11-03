'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLabs: 0,
    pendingLabs: 0,
    totalBookings: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [usersRes, labsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/labs'),
        fetch('/api/bookings'),
      ])

      const users = await usersRes.json()
      const labs = await labsRes.json()
      const bookings = await bookingsRes.json()

      setStats({
        totalUsers: users.length || 0,
        totalLabs: labs.length || 0,
        pendingLabs: labs.filter((l: any) => !l.isVerified).length || 0,
        totalBookings: bookings.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-primary-600" />
            </div>
            <Link
              href="/admin/users"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              Manage Users →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Labs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLabs}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary-600" />
            </div>
            <Link
              href="/admin/labs"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              Manage Labs →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingLabs}</p>
              </div>
              <XCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <Link
              href="/admin/labs?status=pending"
              className="mt-4 inline-block text-yellow-600 hover:text-yellow-700 text-sm font-semibold"
            >
              Review Labs →
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
              href="/admin/bookings"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Users className="w-6 h-6 text-primary-600 mb-2" />
              <p className="font-semibold">Manage Users</p>
              <p className="text-sm text-gray-600">View and manage all user accounts</p>
            </Link>
            <Link
              href="/admin/labs"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Building2 className="w-6 h-6 text-primary-600 mb-2" />
              <p className="font-semibold">Manage Labs</p>
              <p className="text-sm text-gray-600">Verify and manage lab accounts</p>
            </Link>
            <Link
              href="/admin/bookings"
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 transition"
            >
              <Calendar className="w-6 h-6 text-primary-600 mb-2" />
              <p className="font-semibold">View Bookings</p>
              <p className="text-sm text-gray-600">Monitor all bookings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

