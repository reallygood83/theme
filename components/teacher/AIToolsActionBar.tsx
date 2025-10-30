'use client'

import { useState } from 'react'
import { Lightbulb, Search, Sparkles, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AIToolsActionBarProps {
  onDebateScenarioOpen: () => void
  onEvidenceSearchOpen: () => void
}

export default function AIToolsActionBar({
  onDebateScenarioOpen,
  onEvidenceSearchOpen,
}: AIToolsActionBarProps) {
  return (
    <div className="sticky top-20 z-40 mb-6 flex justify-end">
      <TooltipProvider>
        <div className="bg-white/95 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-lg p-2 flex items-center gap-2">
          {/* Direct Action Buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDebateScenarioOpen}
                className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-lg shadow-sm">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-800 hidden sm:block">토론 주제 생성</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI가 주제별 맞춤 토론 시나리오를 생성해드립니다</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEvidenceSearchOpen}
                className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-105"
              >
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-lg shadow-sm">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-green-800 hidden sm:block">근거자료 검색</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>토론 주제에 대한 신뢰할 수 있는 근거자료를 AI가 찾아드립니다</p>
            </TooltipContent>
          </Tooltip>

          {/* Compact Dropdown for Mobile */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 transition-all duration-200">
                  <Menu className="h-4 w-4 text-purple-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI 지원 도구
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDebateScenarioOpen}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-2 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">토론 주제 생성하기</div>
                    <div className="text-xs text-gray-500">AI 맞춤 시나리오 생성</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onEvidenceSearchOpen}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-2 rounded-lg">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">근거자료 검색</div>
                    <div className="text-xs text-gray-500">신뢰할 수 있는 자료 검색</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}