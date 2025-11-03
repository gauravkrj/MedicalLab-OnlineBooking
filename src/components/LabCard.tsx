'use client'

import { Lab, Test } from '@/types'
import { MapPin, Phone, IndianRupee, ArrowRight } from 'lucide-react'

interface LabCardProps {
  lab: Lab
  test: Test
  onSelect: () => void
}

export default function LabCard({ lab, test, onSelect }: LabCardProps) {
  return (
    <div className="group glass rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 hover-lift premium-shadow transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors">{lab.name}</h3>
        {lab.distance !== undefined && (
          <div className="glass px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
            <span className="text-blue-300 text-xs font-semibold">{lab.distance.toFixed(1)} km</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex items-start text-gray-400">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
          <span className="leading-relaxed">
            {lab.address}, {lab.city}, {lab.state} - {lab.pincode}
          </span>
        </div>
        <div className="flex items-center text-gray-400">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-purple-400" />
          <span>{lab.phone}</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Price:</span>
          <div className="flex items-center text-xl font-bold">
            <IndianRupee className="w-5 h-5 mr-1 text-blue-400" />
            <span className="text-gradient">{test.price}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="group/btn w-full flex items-center justify-center gradient-primary text-white py-3 rounded-xl hover:scale-105 transition-all duration-300 font-semibold"
      >
        Select Lab
        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}
