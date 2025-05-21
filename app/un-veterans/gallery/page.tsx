'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/common/Header'
import { getNationById, getNations, Nation } from '@/lib/un-nations'

interface Letter {
  id: string
  nationId: string
  senderName: string
  senderSchool?: string
  senderGrade?: string
  sentDate: string
  content: string
  translatedContent: string
  responseReceived: boolean
}

// Sample letters data
const sampleLetters: Letter[] = [
  {
    id: 'letter1',
    nationId: 'usa',
    senderName: '김지민',
    senderSchool: '서울 대한초등학교',
    senderGrade: '6학년',
    sentDate: '2025-05-15',
    content: `안녕하세요, 미국의 참전용사와 국민 여러분.

저는 대한민국의 초등학생으로서, 1950년부터 1953년까지의 6.25 전쟁 당시 미국이 대한민국을 위해 보여주신 용기와 희생에 깊은 감사를 표하고 싶습니다.

미국에서 파견된 1,789,000 명의 군인들이 자유와 평화를 위해 싸워주셨습니다. 그 중 많은 분들이 목숨을 잃거나 부상을 입으셨고, 아직도 실종 상태인 분들도 계십니다.

여러분의 희생과 도움이 없었다면, 오늘날의 대한민국은 존재하지 않았을 것입니다. 저희는 그 은혜를 절대 잊지 않을 것이며, 앞으로도 양국 간의 우정이 더욱 깊어지길 바랍니다.

진심을 담아 감사드립니다.`,
    translatedContent: `Dear veterans and citizens of the United States,

As an elementary school student from South Korea, I would like to express my deepest gratitude for the courage and sacrifice the United States showed for South Korea during the Korean War from 1950 to 1953.

1,789,000 soldiers sent from the United States fought for freedom and peace. Many of them lost their lives, were injured, and some are still missing.

Without your sacrifice and help, today's South Korea would not exist. We will never forget this debt of gratitude, and hope that the friendship between our two countries will continue to deepen in the future.

Thank you from the bottom of my heart.`,
    responseReceived: true
  },
  {
    id: 'letter2',
    nationId: 'uk',
    senderName: '이서준',
    senderSchool: '부산 평화중학교',
    senderGrade: '2학년',
    sentDate: '2025-05-10',
    content: `안녕하세요, 영국의 참전용사와 국민 여러분.

저는 대한민국의 중학생으로서, 6.25 전쟁 당시 영국이 보여주신 용기와 희생에 깊은 감사의 마음을 전하고 싶습니다.

영국에서 파견된 14,198명의 군인들이 한국의 자유를 위해 싸워주셨고, 글로스터 대대의 용맹한 임진강 전투는 지금도 한국 역사책에 기록되어 있습니다.

영국의 도움이 없었다면 오늘날의 한국은 없었을 것입니다. 영국과 한국의 우정이 앞으로도 계속 이어지길 진심으로 바랍니다.

감사합니다.`,
    translatedContent: `Dear veterans and citizens of the United Kingdom,

As a middle school student from South Korea, I would like to express my deep gratitude for the courage and sacrifice that the United Kingdom showed during the Korean War.

14,198 soldiers sent from the United Kingdom fought for Korea's freedom, and the Gloucester Battalion's valiant Battle of the Imjin River is still recorded in Korean history books.

Without the help of the United Kingdom, today's Korea would not exist. I sincerely hope that the friendship between the United Kingdom and Korea will continue in the future.

Thank you.`,
    responseReceived: false
  },
  {
    id: 'letter3',
    nationId: 'turkey',
    senderName: '박하은',
    senderSchool: '인천 미래고등학교',
    senderGrade: '1학년',
    sentDate: '2025-05-18',
    content: `안녕하세요, 터키의 참전용사와 국민 여러분.

저는 대한민국의 고등학생으로서, 6.25 전쟁 당시 터키가 보여준 용기와 희생에 깊은 감사의 마음을 전합니다.

터키에서 파견된 21,212명의 군인들은 쿠눅리 전투에서 중공군의 공세를 막아내는 등 큰 전과를 올렸습니다. "한국에서 포로가 된 터키군은 없다"는 말이 터키군의 용맹함을 상징합니다.

한국과 터키는 "피로 맺어진 형제국"이라는 표현처럼, 양국의 우정이 앞으로도 더욱 깊어지길 바랍니다.

감사합니다.`,
    translatedContent: `Değerli Türk gazileri ve vatandaşları,

Güney Kore'den bir lise öğrencisi olarak, Kore Savaşı sırasında Türkiye'nin gösterdiği cesaret ve fedakarlık için derin minnettarlığımı ifade etmek istiyorum.

Türkiye'den gönderilen 21.212 asker, Kunuri Muharebesi'nde Çin ordusunun saldırısını önlemek gibi büyük başarılar elde etti. "Kore'de Türk esir yoktur" sözü, Türk askerlerinin cesaretinin sembolüdür.

Kore ve Türkiye arasındaki dostluğun, "kan bağıyla birleşmiş kardeş ülkeler" deyiminde olduğu gibi, gelecekte daha da derinleşmesini diliyorum.

Teşekkür ederim.`,
    responseReceived: true
  }
]

export default function GalleryPage() {
  const searchParams = useSearchParams()
  const nationId = searchParams.get('nation')
  
  const [letters, setLetters] = useState<Letter[]>([])
  const [nations, setNations] = useState<Nation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterNationId, setFilterNationId] = useState<string | null>(nationId)
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Load nations
      const nationsData = await getNations()
      setNations(nationsData)
      
      // In a real app, we would fetch letters from an API
      // For now, just use the sample data
      setLetters(sampleLetters)
      
      setLoading(false)
    }
    
    loadData()
  }, [])
  
  // Filter letters based on selected nation
  const filteredLetters = filterNationId
    ? letters.filter(letter => letter.nationId === filterNationId)
    : letters
  
  // Sort letters by date (newest first)
  const sortedLetters = [...filteredLetters].sort((a, b) => {
    return new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
  })
  
  // Get nation by ID
  const getNationName = (id: string): string => {
    const nation = nations.find(n => n.id === id)
    return nation ? nation.name : id
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/un-veterans" className="text-primary hover:underline flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          참전국 메인으로 돌아가기
        </Link>
        
        <h1 className="text-3xl font-bold text-primary mb-4">감사 편지 갤러리</h1>
        <p className="text-gray-600 mb-8">
          학생들이 6.25 전쟁 참전국에 보낸 감사 편지들을 모아둔 갤러리입니다.
          다른 학생들의 편지를 읽고 영감을 얻거나, 본인의 편지를 공유해보세요.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <label htmlFor="nationFilter" className="block text-gray-700 font-medium mb-2">국가별 필터링</label>
            <select
              id="nationFilter"
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              value={filterNationId || ''}
              onChange={(e) => setFilterNationId(e.target.value || null)}
            >
              <option value="">모든 국가</option>
              {nations.map(nation => (
                <option key={nation.id} value={nation.id}>
                  {nation.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-right mb-4">
            <Link href="/un-veterans/write-letter" className="btn-primary inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              나도 편지 쓰기
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {sortedLetters.length > 0 ? (
                <div className="space-y-6">
                  {sortedLetters.map(letter => (
                    <div key={letter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">{letter.senderName}</span>
                            {letter.senderSchool && (
                              <span className="text-gray-500 text-sm ml-2">
                                {letter.senderSchool} {letter.senderGrade}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {getNationName(letter.nationId)}에게 보낸 편지 ({new Date(letter.sentDate).toLocaleDateString()})
                          </div>
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          {letter.responseReceived ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              답장 받음
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <svg className="mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              대기 중
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-6">
                          <h3 className="font-medium text-gray-700 mb-2">원문</h3>
                          <div className="text-gray-600 whitespace-pre-line text-sm">
                            {letter.content.length > 300 
                              ? letter.content.substring(0, 300) + '...' 
                              : letter.content}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">번역문</h3>
                          <div className="text-gray-600 whitespace-pre-line text-sm">
                            {letter.translatedContent.length > 300 
                              ? letter.translatedContent.substring(0, 300) + '...' 
                              : letter.translatedContent}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 flex justify-between">
                        <Link 
                          href={`/un-veterans/nations/${letter.nationId}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {getNationName(letter.nationId)} 국가 정보 보기
                        </Link>
                        
                        <Link 
                          href={`/un-veterans/gallery/${letter.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          전체 편지 읽기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mb-4">아직 작성된 편지가 없습니다.</p>
                  <Link href="/un-veterans/write-letter" className="btn-primary inline-block">
                    첫 편지 작성하기
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">감사 편지 쓰기의 의의</h2>
          <p className="text-gray-700 mb-4">
            6.25 전쟁 당시 UN 참전국들의 희생과 도움은 오늘날 대한민국의 존재를 가능하게 했습니다.
            현재의 학생들이 참전국에 감사 편지를 작성함으로써 역사적 사실을 배우고, 국제 평화와 협력의 중요성을 이해하며,
            세계 시민으로서의 책임감을 기를 수 있습니다.
          </p>
          <Link href="/un-veterans/write-letter" className="btn-primary inline-block">
            편지 작성 시작하기
          </Link>
        </div>
      </div>
    </>
  )
}