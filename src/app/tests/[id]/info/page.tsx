'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { IndianRupee, MapPin, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react'

type TestDetail = {
  id: string
  name: string
  category?: string
  description?: string
  price: number
  testType?: string
  labId?: string | null
  labName?: string
  about?: string | null
  parameters?: string | null
  preparation?: string | null
  why?: string | null
  interpretations?: string | null
  faqsJson?: Array<{ question: string; answer: string }>
}

export default function TestInfoPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [test, setTest] = useState<TestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const labId = searchParams.get('labId') || undefined

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${params.id}`)
        const data = await res.json()
        setTest(data)
      } catch (e) {
        console.error('Failed to load test info', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTest()
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-300">Loading...</div>
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Test not found
      </div>
    )
  }

  const bookHref = labId
    ? `/tests/${test.id}?labId=${labId}`
    : test.labId
    ? `/tests/${test.id}?labId=${test.labId}`
    : `/tests/${test.id}`

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="glass-dark rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{test.name}</h1>
              <p className="text-gray-400 text-sm">
                {test.category ? `${test.category} • ` : ''}
                {test.labName ? `Provided by ${test.labName}` : 'Premium Diagnostic Test'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-white">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold">{test.price}</span>
              </div>
              <Link
                href={bookHref}
                className="gradient-primary text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs">Reports Within</p>
            <p className="text-white font-semibold text-lg">6 hours</p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs">Parameters Included</p>
            <p className="text-white font-semibold text-lg">24</p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs">Requisites</p>
            <p className="text-white font-semibold text-lg">Blood • No Fasting</p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs">Collection</p>
            <p className="text-white font-semibold text-lg">Home / Clinic</p>
          </div>
        </div>

        {/* Trust markers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass rounded-xl p-4 border border-white/10 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300 text-sm">Certified Labs</span>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300 text-sm">Fast TAT</span>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300 text-sm">Digital Reports</span>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300 text-sm">Home Collection</span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <Section title="About The Test">
            <p className="text-gray-300 leading-relaxed">
              {test.about || test.description || 'This test helps assess your general health by measuring components of blood such as RBCs, WBCs, and platelets.'}
            </p>
          </Section>

          <Section title="List of Parameters">
            {test.parameters ? (
              <ul className="list-disc pl-6 text-gray-300 space-y-1">
                {test.parameters.split(/\n|,/).map((p, i) => (
                  <li key={i}>{p.trim()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">Parameters will be provided by the lab.</p>
            )}
          </Section>

          <Section title="Test Preparation">
            <p className="text-gray-300">{test.preparation || 'No special preparation is required.'}</p>
          </Section>

          <Section title="Why This Test">
            <p className="text-gray-300">{test.why || 'Used for diagnosing and monitoring common hematological conditions.'}</p>
          </Section>

          <Section title="Interpretations">
            <p className="text-gray-300">{test.interpretations || 'Abnormal values may indicate underlying conditions. Consult your physician for interpretation.'}</p>
          </Section>

          <Section title="FAQs">
            {Array.isArray(test.faqsJson) && test.faqsJson.length > 0 ? (
              <Accordion items={test.faqsJson} />
            ) : (
              <p className="text-gray-300">No FAQs added by the lab.</p>
            )}
          </Section>
        </div>

        {/* Sticky CTA */}
        <div className="mt-10 flex justify-end">
          <Link href={bookHref} className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all inline-flex items-center">
            Book Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-dark rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Accordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={idx} className="glass rounded-xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full text-left px-4 py-3 flex justify-between items-center text-gray-200 hover:bg-white/5"
          >
            <span className="font-semibold">{it.question}</span>
            <span className={`transition-transform ${open === idx ? 'rotate-90' : ''}`}>›</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4 text-gray-300">
              {it.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


