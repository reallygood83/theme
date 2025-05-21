'use client'

import { useMemo } from 'react'

type Nation = {
  id: string
  name: string
  flag: string
  type: 'combat' | 'medical' | 'material'
  region: string
  casualties?: number
  deploymentSize?: number
}

type NationStatsProps = {
  nations: Nation[]
  loading: boolean
}

export default function NationStats({ nations, loading }: NationStatsProps) {
  const stats = useMemo(() => {
    return {
      total: nations.length,
      combat: nations.filter(n => n.type === 'combat').length,
      medical: nations.filter(n => n.type === 'medical').length,
      material: nations.filter(n => n.type === 'material').length,
      totalCasualties: nations.reduce((sum, n) => sum + (n.casualties || 0), 0),
      totalDeployment: nations.reduce((sum, n) => sum + (n.deploymentSize || 0), 0),
    }
  }, [nations])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-primary mb-6">참전국 통계</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">총 참전국</p>
          <p className="text-2xl font-bold text-primary">{stats.total}개국</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">전투병 파병국</p>
          <p className="text-2xl font-bold text-red-500">{stats.combat}개국</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">의료 지원국</p>
          <p className="text-2xl font-bold text-green-500">{stats.medical}개국</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">물자 지원국</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.material}개국</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">총 파병 규모</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats.totalDeployment.toLocaleString()}명
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">총 희생자</p>
          <p className="text-2xl font-bold text-gray-700">
            {stats.totalCasualties.toLocaleString()}명
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>* 통계 자료는 공식 역사 자료를 바탕으로 합니다.</p>
      </div>
    </div>
  )
}