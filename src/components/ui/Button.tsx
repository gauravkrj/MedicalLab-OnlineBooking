"use client"

import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'gradient-primary text-white px-6 py-3.5 hover:scale-105',
    secondary:
      'glass text-gray-300 px-6 py-3.5 border border-white/10 hover:bg-white/10',
    ghost:
      'text-gray-300 px-4 py-2 hover:text-white',
  }
  return (
    <button className={[base, variants[variant], className].join(' ')} {...props}>
      {loading && (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
      )}
      {children}
    </button>
  )
}


