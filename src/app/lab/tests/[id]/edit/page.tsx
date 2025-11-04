'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditTestPage() {
  const { data: session, status } = useSession()
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    testType: 'CLINIC_TEST' as 'HOME_TEST' | 'CLINIC_TEST',
    about: '',
    parameters: '',
    preparation: '',
    why: '',
    interpretations: '',
    isActive: true,
  })
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/lab/tests/${params.id}`)
        if (!res.ok) throw new Error('Failed to load test')
        const data = await res.json()
        setFormData({
          name: data.name || '',
          description: data.description || '',
          category: data.category || '',
          price: String(data.price ?? ''),
          duration: data.duration ? String(data.duration) : '',
          testType: data.testType || 'CLINIC_TEST',
          about: data.about || '',
          parameters: data.parameters || '',
          preparation: data.preparation || '',
          why: data.why || '',
          interpretations: data.interpretations || '',
          isActive: Boolean(data.isActive),
        })
        setFaqs(Array.isArray(data.faqsJson) ? data.faqsJson : [])
      } catch (e: any) {
        setError(e.message || 'Failed to load test')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/lab/tests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: formData.duration ? parseInt(formData.duration) : null,
          faqsJson: faqs,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update test')
      router.push('/lab/tests')
    } catch (e: any) {
      setError(e.message || 'Failed to update test')
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'LAB') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/lab/tests" className="flex items-center text-emerald-400 hover:text-emerald-300 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tests
        </Link>

        <div className="glass-dark rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Test</h1>

          {error && (
            <div className="glass rounded-xl p-4 border-red-500/30 bg-red-500/10 text-red-300 mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Test Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Test Type *</label>
                <select
                  required
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value as 'HOME_TEST' | 'CLINIC_TEST' })}
                  className="w-full px-4 py-3.5 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                >
                  <option className="bg-gray-900" value="CLINIC_TEST">Test at Clinic</option>
                  <option className="bg-gray-900" value="HOME_TEST">Home Test</option>
                </select>
              </div>
            </div>

            {/* Info sections */}
            <div className="border-t border-white/10 pt-6">
              <h2 className="text-2xl font-bold text-white mb-4">Test Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">About The Test</label>
                  <textarea
                    rows={8}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">List of Parameters</label>
                  <textarea
                    rows={6}
                    value={formData.parameters}
                    onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                    className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Test Preparation</label>
                    <textarea
                      rows={5}
                      value={formData.preparation}
                      onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                      className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Why This Test</label>
                    <textarea
                      rows={5}
                      value={formData.why}
                      onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                      className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Interpretations</label>
                  <textarea
                    rows={8}
                    value={formData.interpretations}
                    onChange={(e) => setFormData({ ...formData, interpretations: e.target.value })}
                    className="w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">FAQs</label>
                  <div className="space-y-3">
                    {faqs.map((f, idx) => (
                      <div key={idx} className="glass rounded-xl p-4 border border-white/10">
                        <input
                          type="text"
                          value={f.question}
                          onChange={(e) => {
                            const next = [...faqs]; next[idx] = { ...next[idx], question: e.target.value }; setFaqs(next)
                          }}
                          className="w-full mb-2 px-4 py-3 glass rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                          placeholder="Question"
                        />
                        <textarea
                          rows={3}
                          value={f.answer}
                          onChange={(e) => {
                            const next = [...faqs]; next[idx] = { ...next[idx], answer: e.target.value }; setFaqs(next)
                          }}
                          className="w-full px-4 py-3 glass rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none"
                          placeholder="Answer"
                        />
                        <div className="text-right mt-2">
                          <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="text-sm text-red-300 hover:text-red-200">Remove</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="glass text-gray-200 px-4 py-2 rounded-lg hover:bg-white/10 border border-white/10">
                      + Add FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm text-gray-300">Active</label>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => router.back()} className="flex-1 glass text-gray-200 py-3 rounded-lg hover:bg-white/10 transition font-semibold border border-white/10">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 gradient-primary text-white py-3 rounded-lg transition font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


