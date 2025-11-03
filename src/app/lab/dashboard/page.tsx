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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'LAB') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="text-gradient">Lab</span> <span className="text-white">Dashboard</span>
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 hover-lift transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-white">{stats.totalTests}</p>
              </div>
              <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
            </div>
            <Link
              href="/lab/tests"
              className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
            >
              Manage Tests →
            </Link>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 hover-lift transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
              </div>
              <div className="w-14 h-14 gradient-secondary rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
            <Link
              href="/lab/bookings"
              className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-colors"
            >
              View Bookings →
            </Link>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10 hover:border-amber-500/50 hover-lift transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Bookings</p>
                <p className="text-3xl font-bold text-amber-400">{stats.pendingBookings}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
            <Link
              href="/lab/bookings?status=PENDING"
              className="mt-4 inline-block text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
            >
              Review Pending →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-dark rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/lab/tests/new"
              className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover-lift"
            >
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">Add New Test</span>
            </Link>
            <Link
              href="/lab/profile"
              className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover-lift"
            >
              <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">Edit Profile</span>
            </Link>
            <Link
              href="/lab/bookings"
              className="flex items-center space-x-3 p-4 glass rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover-lift"
            >
              <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">View All Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

