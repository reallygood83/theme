'use client'

import { useState } from 'react'
import { Card } from '../common/Card'

export default function QuestionHelper() {
  const [activeTab, setActiveTab] = useState<'time' | 'space' | 'social' | 'ethics'>('time')
  
  // 관점별 설명 및 예시 질문
  const perspectives = {
    time: {
      title: '시간적 관점',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '과거, 현재, 미래의 시간적 흐름에서 생각해보는 관점입니다.',
      examples: [
        '이것은 과거에 어떻게 다루어졌나요?',
        '미래에는 어떻게 변화할까요?',
        '현재와 과거의 차이점은 무엇인가요?',
        '이 문제가 시간이 지남에 따라 어떻게 발전했나요?',
        '역사적으로 볼 때 이 문제의 원인은 무엇인가요?'
      ]
    },
    space: {
      title: '공간적 관점',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '지역, 국가, 세계 등 다양한 공간적 범위에서 생각해보는 관점입니다.',
      examples: [
        '다른 나라에서는 이 문제를 어떻게 해결하고 있나요?',
        '지역별로 어떤 차이가 있을까요?',
        '환경적 요소가 이 상황에 어떤 영향을 미치나요?',
        '이 현상은 어디에서 가장 많이 나타나나요?',
        '우리나라와 다른 나라의 접근법은 어떻게 다른가요?'
      ]
    },
    social: {
      title: '사회적 관점',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: '사회 구조, 제도, 관계, 문화적 측면에서 생각해보는 관점입니다.',
      examples: [
        '이것이 사회에 어떤 영향을 미치나요?',
        '어떤 사람들이 이 문제로 가장 큰 영향을 받나요?',
        '이 문제와 관련된 다양한 의견은 무엇인가요?',
        '우리 사회의 어떤 가치가 이 문제와 관련이 있나요?',
        '이 주제에 대한 세대 간 인식 차이가 있나요?'
      ]
    },
    ethics: {
      title: '윤리적 관점',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: '옳고 그름, 가치판단, 도덕적 측면에서 생각해보는 관점입니다.',
      examples: [
        '이것은 공정한가요?',
        '누구의 책임인가요?',
        '이 상황에서 가장 중요한 가치는 무엇인가요?',
        '더 나은 방법은 무엇일까요?',
        '이 문제에 대한 윤리적 딜레마는 무엇인가요?'
      ]
    }
  }
  
  return (
    <Card>
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-4">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">다양한 관점에서 질문을 생각해보면 더 깊이 있는 토론을 할 수 있습니다. 각 관점별로 제시된 예시 질문을 참고해보세요.</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(perspectives) as Array<keyof typeof perspectives>).map((key) => (
            <button
              key={key}
              className={`px-3 py-3 rounded-md flex flex-col items-center justify-center transition-colors 
                ${activeTab === key 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setActiveTab(key)}
            >
              <div className={`mb-1 ${activeTab === key ? 'text-white' : 'text-primary'}`}>
                {perspectives[key].icon}
              </div>
              <span className="text-sm font-medium">{perspectives[key].title}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="border border-gray-100 p-5 rounded-lg bg-white shadow-sm">
        <div className="flex items-center mb-3">
          <div className="bg-primary/10 p-2 rounded-full mr-2">
            {perspectives[activeTab].icon}
          </div>
          <h3 className="font-medium text-lg">{perspectives[activeTab].title}</h3>
        </div>
        
        <p className="mb-4 text-gray-700 border-l-4 border-primary/20 pl-4 py-1">
          {perspectives[activeTab].description}
        </p>
        
        <h4 className="font-medium text-primary mb-3">이런 질문을 해보세요:</h4>
        <ul className="space-y-2">
          {perspectives[activeTab].examples.map((example, index) => (
            <li key={index} className="flex items-start">
              <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0 mr-2 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{example}</p>
            </li>
          ))}
        </ul>
        
        <div className="mt-5 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-gray-700 mb-2">도움말:</h4>
          <p className="text-sm text-gray-600">
            토론 주제에 대해 위 예시 질문들을 변형하여 질문을 만들어보세요. 
            다양한 관점에서 질문을 하면 토론의 깊이가 더해지고 새로운 생각을 발견할 수 있습니다.
          </p>
        </div>
      </div>
    </Card>
  )
}