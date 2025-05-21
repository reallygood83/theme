'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/common/Header'
import { getNationById, getNations, Nation } from '@/lib/un-nations'
import { translateLetter } from '@/lib/translate'

export default function WriteLetterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nationId = searchParams.get('nation')
  
  const [selectedNation, setSelectedNation] = useState<Nation | null>(null)
  const [nations, setNations] = useState<Nation[]>([])
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  
  const [letterForm, setLetterForm] = useState({
    senderName: '',
    senderSchool: '',
    senderGrade: '',
    receiverType: 'embassy',
    content: '',
    agreeToShare: false
  })
  
  const [translatedContent, setTranslatedContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Load all nations
      const nationsData = await getNations()
      setNations(nationsData)
      
      // Load selected nation if provided
      if (nationId) {
        const nationData = await getNationById(nationId)
        setSelectedNation(nationData)
        
        // Set default letter content template based on the nation
        if (nationData) {
          setLetterForm(prev => ({
            ...prev,
            content: `안녕하세요, ${nationData.name}의 참전용사와 국민 여러분.

저는 대한민국의 학생으로서, 1950년부터 1953년까지의 6.25 전쟁 당시 귀국이 대한민국을 위해 보여주신 용기와 희생에 깊은 감사를 표하고 싶습니다.

${nationData.type === 'combat' 
  ? `귀국에서 파견된 ${nationData.deploymentSize?.toLocaleString() || '많은'} 명의 군인들이 자유와 평화를 위해 싸워주셨습니다.`
  : nationData.type === 'medical'
    ? '귀국에서 파견된 의료진들이 전쟁 중 부상자들의 생명을 구하기 위해 헌신적으로 활동해주셨습니다.'
    : '귀국에서 보내주신 물자와 원조가 한국 전쟁의 극복과 이후 재건에 큰 도움이 되었습니다.'
}

여러분의 희생과 도움이 없었다면, 오늘날의 대한민국은 존재하지 않았을 것입니다. 저희는 그 은혜를 절대 잊지 않을 것이며, 앞으로도 양국 간의 우정이 더욱 깊어지길 바랍니다.

진심을 담아 감사드립니다.`
          }))
        }
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [nationId])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setLetterForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLetterForm(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }))
  }
  
  const handleNationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNationId = e.target.value
    
    if (newNationId) {
      const nationData = await getNationById(newNationId)
      setSelectedNation(nationData)
      
      // Update URL with the selected nation
      router.push(`/un-veterans/write-letter?nation=${newNationId}`)
    } else {
      setSelectedNation(null)
      router.push('/un-veterans/write-letter')
    }
  }
  
  const handleTranslate = async () => {
    if (!selectedNation || !letterForm.content) return
    
    setTranslating(true)
    try {
      // 번역 기능이 비활성화되었으므로 임시 메시지 표시
      setTranslatedContent("번역 기능은 현재 사용할 수 없습니다. 추후 업데이트 예정입니다.")
      setPreviewMode(true)
    } catch (error) {
      console.error('번역 오류:', error)
      alert('번역 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setTranslating(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedNation) {
      alert('참전국을 선택해주세요.')
      return
    }
    
    if (!letterForm.content) {
      alert('편지 내용을 입력해주세요.')
      return
    }
    
    if (!letterForm.senderName) {
      alert('이름을 입력해주세요.')
      return
    }
    
    if (!letterForm.agreeToShare) {
      alert('편지 공유에 동의해주세요.')
      return
    }
    
    // If not in preview mode, translate first
    if (!previewMode) {
      await handleTranslate()
      return
    }
    
    // Otherwise, submit the letter
    // This would be connected to an API endpoint in a real implementation
    alert('편지가 성공적으로 제출되었습니다! 실제 구현에서는 여기서 편지가 전송됩니다.')
    router.push('/un-veterans/gallery')
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
        
        <h1 className="text-3xl font-bold text-primary mb-4">감사 편지 작성</h1>
        <p className="text-gray-600 mb-8">
          6.25 전쟁 참전국에 감사의 마음을 담아 편지를 작성하세요. 작성한 편지는 자동으로 해당 국가의 언어로 번역되어 전달됩니다.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="mb-6">
                  <label htmlFor="nation" className="block text-gray-700 font-medium mb-2">참전국 선택</label>
                  <select
                    id="nation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedNation?.id || ''}
                    onChange={handleNationChange}
                    required
                  >
                    <option value="">참전국을 선택하세요</option>
                    {nations.map(nation => (
                      <option key={nation.id} value={nation.id}>
                        {nation.name} ({nation.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedNation && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-6 relative mr-2 overflow-hidden">
                        <Image
                          src={selectedNation.flag}
                          alt={`${selectedNation.name} 국기`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <h3 className="font-medium">{selectedNation.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedNation.type === 'combat' && '전투병 파병국'}
                      {selectedNation.type === 'medical' && '의료 지원국'}
                      {selectedNation.type === 'material' && '물자 지원국'}
                    </p>
                    {selectedNation.languages && (
                      <p className="text-sm text-gray-600">
                        지원 언어: {selectedNation.languages.map(lang => 
                          lang === 'en' ? '영어' : 
                          lang === 'fr' ? '프랑스어' : 
                          lang === 'tr' ? '터키어' : 
                          lang === 'sv' ? '스웨덴어' : lang
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">작성자 정보</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="senderName" className="block text-gray-600 text-sm mb-1">이름</label>
                    <input
                      type="text"
                      id="senderName"
                      name="senderName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={letterForm.senderName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="senderSchool" className="block text-gray-600 text-sm mb-1">학교</label>
                    <input
                      type="text"
                      id="senderSchool"
                      name="senderSchool"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={letterForm.senderSchool}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="senderGrade" className="block text-gray-600 text-sm mb-1">학년</label>
                    <input
                      type="text"
                      id="senderGrade"
                      name="senderGrade"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={letterForm.senderGrade}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="receiverType" className="block text-gray-600 text-sm mb-1">받는 곳</label>
                    <select
                      id="receiverType"
                      name="receiverType"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={letterForm.receiverType}
                      onChange={handleInputChange}
                    >
                      <option value="embassy">대사관</option>
                      <option value="veterans">참전용사 협회</option>
                      <option value="government">정부 기관</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToShare"
                        className="mt-1 mr-2"
                        checked={letterForm.agreeToShare}
                        onChange={handleCheckboxChange}
                        required
                      />
                      <span className="text-sm text-gray-600">
                        작성한 편지를 웹사이트 갤러리에 공유하는 것에 동의합니다.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                {previewMode ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-700">편지 미리보기</h3>
                      <button
                        type="button"
                        className="text-primary hover:underline text-sm"
                        onClick={() => setPreviewMode(false)}
                      >
                        편집으로 돌아가기
                      </button>
                    </div>
                    
                    <div className="bg-cream border border-gray-200 rounded-lg p-6 mb-6 min-h-[400px]">
                      <div className="flex items-center mb-4">
                        <h4 className="font-medium">원문 (한국어)</h4>
                      </div>
                      <div className="whitespace-pre-line text-gray-700 mb-8">
                        {letterForm.content}
                      </div>
                      
                      <div className="border-t border-gray-300 my-6"></div>
                      
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-4 relative mr-2 overflow-hidden">
                          {selectedNation && (
                            <Image
                              src={selectedNation.flag}
                              alt={`${selectedNation.name} 국기`}
                              fill
                              className="object-cover rounded"
                            />
                          )}
                        </div>
                        <h4 className="font-medium">
                          번역문 ({selectedNation?.languages?.[0] === 'en' ? '영어' : 
                                 selectedNation?.languages?.[0] === 'fr' ? '프랑스어' : 
                                 selectedNation?.languages?.[0] === 'tr' ? '터키어' : 
                                 selectedNation?.languages?.[0] === 'sv' ? '스웨덴어' : 
                                 selectedNation?.languages?.[0] || '영어'})
                        </h4>
                      </div>
                      <div className="whitespace-pre-line text-gray-700">
                        {translatedContent}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="btn-primary w-full py-3"
                      disabled={translating}
                    >
                      {translating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          번역 중...
                        </>
                      ) : '편지 보내기'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                        편지 내용
                        <span className="ml-2 text-sm text-gray-500">최대 5000자</span>
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[400px]"
                        value={letterForm.content}
                        onChange={handleInputChange}
                        maxLength={5000}
                        placeholder="참전국에 감사의 마음을 담아 편지를 작성해주세요."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {letterForm.content.length}/5000자
                      </p>
                      
                      <button
                        type="button"
                        className="btn-primary py-2 px-4"
                        onClick={handleTranslate}
                        disabled={!letterForm.content || !selectedNation || translating}
                      >
                        {translating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            번역 중...
                          </>
                        ) : '번역 및 미리보기'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}