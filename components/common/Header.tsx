'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  return (
    <header className="bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            질문톡톡! 논제샘솟!
          </h1>
        </Link>
        
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link 
                href="/"
                className={`text-gray-600 hover:text-primary ${pathname === '/' ? 'font-medium text-primary' : ''}`}
              >
                홈
              </Link>
            </li>
            <li>
              <Link 
                href="/teacher/session/create"
                className={`text-gray-600 hover:text-primary ${pathname?.startsWith('/teacher') ? 'font-medium text-primary' : ''}`}
              >
                교사용
              </Link>
            </li>
            <li>
              <Link 
                href="/guide"
                className={`text-gray-600 hover:text-primary ${pathname === '/guide' ? 'font-medium text-primary' : ''}`}
              >
                이용 가이드
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}