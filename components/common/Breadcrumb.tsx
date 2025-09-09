'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex ${className} breadcrumb-mobile`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
        {/* 홈 아이콘 */}
        <li className="flex-shrink-0">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">홈</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center flex-shrink-0">
            <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 mx-1 sm:mx-2 breadcrumb-separator" />
            {item.href && index < items.length - 1 ? (
              <Link 
                href={item.href}
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors whitespace-nowrap breadcrumb-item"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap breadcrumb-item">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}