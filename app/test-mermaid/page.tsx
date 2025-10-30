'use client'

import MermaidDiagram from '@/components/common/MermaidDiagram'

export default function TestMermaidPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mermaid 테스트 페이지</h1>
      
      <div className="space-y-8">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">간단한 플로우차트</h2>
          <MermaidDiagram 
            chart={`graph TD
    A[시작] --> B[처리]
    B --> C[끝]`}
            className="w-full"
          />
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">복잡한 다이어그램</h2>
          <MermaidDiagram 
            chart={`graph TD
    A[👨‍🏫 교사] --> B[세션 생성]
    B --> C[학습자료 제공]
    C --> D[👥 학생 초대]
    D --> E[❓ 질문 수집]
    E --> F[🤖 AI 분석]
    F --> G[📋 토론 주제 생성]
    
    style A fill:#e1f5fe
    style F fill:#fff3e0
    style G fill:#e8f5e8`}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}