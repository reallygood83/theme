'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'

interface NavigationActionsProps {
  backHref?: string
  backLabel?: string
  nextHref?: string
  nextLabel?: string
  showBackButton?: boolean
  showNextButton?: boolean
  className?: string
}

export default function NavigationActions({
  backHref,
  backLabel = '이전으로',
  nextHref,
  nextLabel = '다음으로',
  showBackButton = true,
  showNextButton = false,
  className = ''
}: NavigationActionsProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const handleNext = () => {
    if (nextHref) {
      router.push(nextHref)
    }
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showBackButton ? (
        <Button
          variant="outline"
          onClick={handleBack}
          className="nav-button-responsive flex items-center gap-2 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
          <span className="sm:hidden">이전</span>
        </Button>
      ) : (
        <div></div>
      )}

      {showNextButton && nextHref && (
        <Button
          onClick={handleNext}
          className="nav-button-responsive flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all min-h-[44px]"
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <span className="sm:hidden">다음</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}