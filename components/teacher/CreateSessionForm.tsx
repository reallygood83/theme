'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../common/Button'
import { generateSessionCode } from '@/lib/utils'
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'
import { useAuth } from '@/contexts/AuthContext'

interface Material {
  id: string
  type: 'text' | 'youtube' | 'file' | 'link'
  content?: string
  url?: string
  fileName?: string
  fileUrl?: string
  linkTitle?: string
}

export default function CreateSessionForm() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sessionTitle, setSessionTitle] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessOptions, setShowSuccessOptions] = useState(false)
  const [createdSessionId, setCreatedSessionId] = useState('')
  const [createdSessionCode, setCreatedSessionCode] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  
  const addMaterial = (type: Material['type']) => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '' : undefined,
      url: type === 'youtube' || type === 'link' ? '' : undefined,
      linkTitle: type === 'link' ? '' : undefined,
    }
    setMaterials([...materials, newMaterial])
  }
  
  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(material => 
      material.id === id ? { ...material, ...updates } : material
    ))
  }
  
  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id))
  }
  
  const handleFileUpload = async (materialId: string, file: File) => {
    if (!file) return
    
    // 클라이언트 사이드에서 storage 인스턴스 가져오기
    const storage = getStorage()
    if (!storage) {
      alert('파일 업로드 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }
    
    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.')
      return
    }
    
    // 허용된 파일 형식 확인
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.hwp']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!allowedTypes.includes(fileExtension)) {
      alert('지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, TXT, HWP 파일만 업로드 가능합니다.')
      return
    }
    
    setUploadingFiles(prev => new Set(prev).add(materialId))
    
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const fileRef = storageRef(storage, `session-materials/${fileName}`)
      
      const snapshot = await uploadBytes(fileRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)
      
      updateMaterial(materialId, {
        fileName: file.name,
        fileUrl: downloadUrl
      })
    } catch (error) {
      console.error('파일 업로드 오류:', error)
      alert('파일 업로드에 실패했습니다.')
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(materialId)
        return newSet
      })
    }
  }
  
  const handleAddKeyword = () => {
    if (keywordInput.trim() && keywords.length < 3) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }
  
  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleGoToDashboard = () => {
    router.push('/teacher/dashboard')
  }

  const handleGoToSession = () => {
    router.push(`/teacher/session/${createdSessionId}?code=${createdSessionCode}`)
  }
  
  const validateMaterials = () => {
    for (const material of materials) {
      if (material.type === 'text' && (!material.content || !material.content.trim())) {
        alert('텍스트 자료의 내용을 입력해주세요.')
        return false
      }
      if (material.type === 'youtube') {
        if (!material.url || !material.url.trim()) {
          alert('유튜브 URL을 입력해주세요.')
          return false
        }
        // YouTube URL 형식 검증
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
        if (!youtubeRegex.test(material.url)) {
          alert('올바른 유튜브 URL 형식이 아닙니다.')
          return false
        }
      }
      if (material.type === 'file' && (!material.fileName || !material.fileUrl)) {
        alert('파일을 업로드해주세요.')
        return false
      }
      if (material.type === 'link') {
        if (!material.url || !material.url.trim()) {
          alert('링크 URL을 입력해주세요.')
          return false
        }
        if (!material.linkTitle || !material.linkTitle.trim()) {
          alert('링크 제목을 입력해주세요.')
          return false
        }
        // URL 형식 검증
        try {
          new URL(material.url)
        } catch (e) {
          alert('올바른 URL 형식이 아닙니다. (예: https://example.com)')
          return false
        }
      }
    }
    return true
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (materials.length === 0) {
      alert('최소 1개 이상의 학습 자료를 추가해주세요.')
      return
    }
    
    if (!validateMaterials()) {
      alert('모든 자료의 내용을 입력해주세요.')
      return
    }
    
    setIsLoading(true)
    
    try {
      // 세션 정보 준비
      const sessionCode = generateSessionCode()
      console.log('세션 생성 시 user 정보:', { uid: user?.uid, email: user?.email })
      
      const sessionData = {
        title: sessionTitle.trim() || '제목 없음',
        teacherId: user?.uid || '', // 교사 ID 추가
        materials: materials.map(material => ({
          type: material.type,
          content: material.content,
          url: material.url,
          fileName: material.fileName,
          fileUrl: material.fileUrl,
          linkTitle: material.linkTitle
        })),
        keywords,
        accessCode: sessionCode,
        createdAt: Date.now()
      }
      
      // API 엔드포인트에 세션 생성 요청
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) {
        throw new Error('세션 생성에 실패했습니다.')
      }
      
      const { sessionId } = await response.json()
      
      console.log('세션 생성 성공:', sessionId)
      
      // 성공 옵션 화면 표시
      setCreatedSessionId(sessionId)
      setCreatedSessionCode(sessionCode)
      setShowSuccessOptions(true)
    } catch (error) {
      console.error('세션 생성 오류:', error)
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (showSuccessOptions) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex justify-center mb-4">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            세션이 성공적으로 생성되었습니다!
          </h2>
          <p className="text-green-700 mb-4">
            세션 코드: <span className="font-mono font-bold text-lg">{createdSessionCode}</span>
          </p>
          <p className="text-sm text-green-600">
            학생들에게 위 세션 코드를 공유하여 질문 작성에 참여하도록 안내하세요.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            다음 단계를 선택하세요
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleGoToDashboard}
              variant="primary"
              className="w-full py-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              대시보드로 이동
            </Button>
            
            <Button
              onClick={handleGoToSession}
              variant="secondary"
              className="w-full py-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              세션 관리 페이지로 이동
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mt-6">
            대시보드에서는 모든 세션을 한눈에 보고 관리할 수 있습니다.<br/>
            세션 관리 페이지에서는 학생 질문을 실시간으로 확인하고 AI 분석을 시작할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          세션 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="예: 환경보호와 경제발전의 균형"
          required
          maxLength={100}
        />
        <p className="text-sm text-gray-500 mt-1">
          토론 세션을 쉽게 구분할 수 있는 제목을 입력하세요. (최대 100자)
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">학습 자료</h2>
        
        {/* 자료 목록 */}
        <div className="space-y-4 mb-4">
          {materials.map((material, index) => (
            <div key={material.id} className="border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">
                  자료 {index + 1} - {material.type === 'text' ? '텍스트' : material.type === 'youtube' ? '유튜브 영상' : material.type === 'link' ? '링크' : '파일'}
                </h3>
                <button
                  type="button"
                  onClick={() => removeMaterial(material.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {material.type === 'text' && (
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="학생들이 질문을 생성할 텍스트 자료를 입력하세요..."
                  value={material.content || ''}
                  onChange={(e) => updateMaterial(material.id, { content: e.target.value })}
                  rows={6}
                  required
                />
              )}
              
              {material.type === 'youtube' && (
                <input
                  type="url"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={material.url || ''}
                  onChange={(e) => updateMaterial(material.id, { url: e.target.value })}
                  required
                />
              )}
              
              {material.type === 'link' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      링크 제목
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="예: '환경보호와 경제발전' 관련 기사"
                      value={material.linkTitle || ''}
                      onChange={(e) => updateMaterial(material.id, { linkTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="https://example.com/article"
                      value={material.url || ''}
                      onChange={(e) => updateMaterial(material.id, { url: e.target.value })}
                      required
                    />
                    <div className="mt-1 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        🌐 신문 기사, 블로그, 웹 페이지 등의 링크를 입력하세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {material.type === 'file' && (
                <div>
                  {material.fileUrl ? (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{material.fileName}</span>
                      <button
                        type="button"
                        onClick={() => updateMaterial(material.id, { fileName: undefined, fileUrl: undefined })}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        파일 제거
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.hwp"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(material.id, file)
                        }}
                        className="hidden"
                        id={`file-input-${material.id}`}
                      />
                      <label
                        htmlFor={`file-input-${material.id}`}
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {uploadingFiles.has(material.id) ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            업로드 중...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            파일 선택
                          </>
                        )}
                      </label>
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-700">
                          📄 지원 형식: PDF, DOC, DOCX, TXT, HWP (최대 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 자료 추가 버튼 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => addMaterial('text')}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            텍스트
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => addMaterial('youtube')}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            유튜브
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => addMaterial('link')}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            링크
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => addMaterial('file')}
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            파일
          </Button>
        </div>
        
        {materials.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            최소 1개 이상의 학습 자료를 추가해주세요.
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          핵심 키워드 (선택, 최대 3개)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="키워드 입력..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            disabled={keywords.length >= 3}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddKeyword()
              }
            }}
          />
          <Button 
            type="button"
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim() || keywords.length >= 3}
          >
            추가
          </Button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          자료의 핵심 키워드를 최대 3개까지 입력하세요. AI가 더 정확한 논제를 제안하는 데 도움이 됩니다.
        </p>
        
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((keyword, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          size="lg"
          isLoading={isLoading}
          disabled={materials.length === 0 || uploadingFiles.size > 0}
        >
          세션 생성하기
        </Button>
      </div>
    </form>
  )
}