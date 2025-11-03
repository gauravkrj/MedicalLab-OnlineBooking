'use client'

import Link from 'next/link'
import { Test, TestType } from '@/types'
import { Clock, IndianRupee, Home, Building2, ArrowRight } from 'lucide-react'

interface TestCardProps {
  test: Test
}

export default function TestCard({ test }: TestCardProps) {
  return (
    <div className="group glass rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 hover-lift premium-shadow transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors">{test.name}</h3>
        <div className="flex flex-col items-end space-y-2">
          <span className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">
            {test.category}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1 border ${
            test.testType === TestType.HOME_TEST
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
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

      {test.labName && (
        <p className="text-xs text-gray-400 mb-2">Provided by <span className="text-emerald-300 font-semibold">{test.labName}</span></p>
      )}
      
      {test.description && (
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">{test.description}</p>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1 text-white">
          <IndianRupee className="w-5 h-5 text-blue-400" />
          <span className="text-2xl font-bold text-gradient">{test.price}</span>
        </div>
        {test.duration && (
          <div className="flex items-center text-gray-400 text-sm glass px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
            <span>{test.duration} days</span>
          </div>
        )}
      </div>

      <Link
        href={test.labId ? `/tests/${test.id}?labId=${test.labId}` : `/tests/${test.id}`}
        className="group/btn flex items-center justify-center w-full gradient-primary text-white py-3 rounded-xl hover:scale-105 transition-all duration-300 font-semibold"
      >
        Book Test
        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}
