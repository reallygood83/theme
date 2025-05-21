'use client'

import { useState } from 'react'
import Card from '../common/Card'

export default function QuestionHelper() {
  const [activeTab, setActiveTab] = useState<'time' | 'space' | 'social' | 'ethics'>('time')
  
  // 관점별 설명 및 예시 질문
  const perspectives = {
    time: {
      title: '시간적 관점',
      description: '과거, 현재, 미래의 시간적 흐름에서 생각해보는 관점입니다.',
      examples: [
        '이것은 과거에 어떻게 다루어졌나요?',
        '미래에는 어떻게 변화할까요?',
        '현재와 과거의 차이점은 무엇인가요?',
        '이 문제가 시간이 지남에 따라 어떻게 발전했나요?'
      ]
    },
    space: {
      title: '공간적 관점',
      description: '지역, 국가, 세계 등 다양한 공간적 범위에서 생각해보는 관점입니다.',
      examples: [
        '다른 나라에서는 이 문제를 어떻게 해결하고 있나요?',
        '지역별로 어떤 차이가 있을까요?',
        '환경적 요소가 이 상황에 어떤 영향을 미치나요?',
        '이 현상은 어디에서 가장 많이 나타나나요?'
      ]
    },
    social: {
      title: '사회적 관점',
      description: '사회 구조, 제도, 관계, 문화적 측면에서 생각해보는 관점입니다.',
      examples: [
        '이것이 사회에 어떤 영향을 미치나요?',
        '어떤 사람들이 이 문제로 가장 큰 영향을 받나요?',
        '이 문제와 관련된 다양한 의견은 무엇인가요?',
        '우리 사회의 어떤 가치가 이 문제와 관련이 있나요?'
      ]
    },
    ethics: {
      title: '윤리적 관점',
      description: '옳고 그름, 가치판단, 도덕적 측면에서 생각해보는 관점입니다.',
      examples: [
        '이것은 공정한가요?',
        '누구의 책임인가요?',
        '이 상황에서 가장 중요한 가치는 무엇인가요?',
        '더 나은 방법은 무엇일까요?'
      ]
    }
  }
  
  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold mb-4">질문 도우미</h2>
      
      <div className="mb-4">
        <div className="flex border-b">
          {(Object.keys(perspectives) as Array<keyof typeof perspectives>).map((key) => (
            <button
              key={key}
              className={`px-4 py-2 font-medium text-sm flex-1 
                ${activeTab === key 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab(key)}
            >
              {perspectives[key].title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-lg mb-2">{perspectives[activeTab].title}</h3>
        <p className="mb-4 text-gray-700">{perspectives[activeTab].description}</p>
        
        <h4 className="font-medium text-sm text-gray-700 mb-2">예시 질문:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {perspectives[activeTab].examples.map((example, index) => (
            <li key={index}>{example}</li>
          ))}
        </ul>
      </div>
    </Card>
  )
}