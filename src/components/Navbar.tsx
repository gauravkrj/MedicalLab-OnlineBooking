'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ShoppingCart, User, LogOut, Sparkles } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="glass-dark sticky top-0 z-50 border-b border-white/10 premium-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                MedLab
              </span>
              <span className="text-xs text-gray-400 -mt-1">Premium Healthcare</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/tests" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
            >
              All Tests
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/labs" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
            >
              Find Labs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {session?.user?.role === 'LAB' && (
              <Link 
                href="/lab/dashboard" 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Lab Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {session?.user?.role === 'ADMIN' && (
              <Link 
                href="/admin/dashboard" 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                Admin Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {session?.user?.role === 'USER' && (
              <Link 
                href="/bookings" 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium relative group"
              >
                My Bookings
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {session ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <div className="flex items-center space-x-3 px-4 py-2 glass rounded-lg">
                  <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-200 font-medium">{session.user?.name || session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2 glass rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-4 animate-slide-up border-t border-white/10 mt-4">
            <Link 
              href="/" 
              className="block text-gray-300 hover:text-white transition-colors py-2 px-4 glass rounded-lg hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/tests" 
              className="block text-gray-300 hover:text-white transition-colors py-2 px-4 glass rounded-lg hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              All Tests
            </Link>
            <Link 
              href="/labs" 
              className="block text-gray-300 hover:text-white transition-colors py-2 px-4 glass rounded-lg hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Find Labs
            </Link>
            {session?.user?.role === 'USER' && (
              <Link 
                href="/bookings" 
                className="block text-gray-300 hover:text-white transition-colors py-2 px-4 glass rounded-lg hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                My Bookings
              </Link>
            )}
            {session ? (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="px-4 py-2 glass rounded-lg">
                  <p className="text-gray-300 text-sm">{session.user?.name || session.user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block gradient-primary text-white px-4 py-3 rounded-lg text-center font-semibold premium-shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
