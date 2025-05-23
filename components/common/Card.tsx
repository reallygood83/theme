'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string | React.ReactNode
  className?: string
}

export default function Card({ children, title, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        typeof title === 'string' ? (
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        ) : (
          <div className="text-xl font-semibold mb-4">{title}</div>
        )
      )}
      {children}
    </div>
  )
}