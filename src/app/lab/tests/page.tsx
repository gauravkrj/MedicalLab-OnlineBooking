'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, ArrowLeft, Home, Building2 } from 'lucide-react'
import { Test, TestType } from '@/types'

export default function LabTestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'LAB') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === 'LAB') {
      fetchTests()
    }
  }, [session])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lab/tests')
      const data = await response.json()
      setTests(data)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      const response = await fetch(`/api/lab/tests/${testId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTests()
      } else {
        alert('Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Failed to delete test')
    }
  }

  if (status === 'loading' || loading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/lab/dashboard"
              className="flex items-center text-emerald-400 hover:text-emerald-300 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">My Tests</h1>
          </div>
          <Link
            href="/lab/tests/new"
            className="flex items-center space-x-2 gradient-primary text-white px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Test</span>
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="glass-dark rounded-2xl p-12 text-center border border-white/10">
            <p className="text-gray-400 text-lg mb-4">No tests added yet</p>
            <Link
              href="/lab/tests/new"
              className="inline-flex items-center space-x-2 gradient-primary text-white px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Test</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{test.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-2 py-1 rounded">
                        {test.category}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center space-x-1 ${
                        test.testType === TestType.HOME_TEST
                          ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                          : 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
                      }`}>
                        {test.testType === TestType.HOME_TEST ? (
                          <>
                            <Home className="w-3 h-3" />
                            <span>Home</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" />
                            <span>Clinic</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/lab/tests/${test.id}/edit`}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {test.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{test.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="text-lg font-bold text-white">₹{test.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        test.isActive
                          ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                          : 'bg-gray-500/15 border border-gray-500/30 text-gray-300'
                      }`}
                    >
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

