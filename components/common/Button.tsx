'use client'

import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-indigo-600 focus:ring-indigo-500',
    secondary: 'bg-secondary text-white hover:bg-emerald-600 focus:ring-emerald-500',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  
  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  }
  
  const widthStyles = fullWidth ? 'w-full' : ''
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <button
      type={type}
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${widthStyles} 
        ${disabledStyles}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>로딩 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export { Button }