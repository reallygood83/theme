'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { Session } from '@/lib/utils'
import { Button } from '../common/Button'
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'

interface Material {
  id: string
  type: 'text' | 'youtube' | 'file' | 'link'
  content?: string
  url?: string
  fileName?: string
  fileUrl?: string
  linkTitle?: string
}

interface EditSessionModalProps {
  session: Session | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function EditSessionModal({ session, isOpen, onClose, onUpdate }: EditSessionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sessionTitle, setSessionTitle] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  // 모달이 열릴 때 세션 데이터로 폼 초기화
  useEffect(() => {
    if (session && isOpen) {
      setSessionTitle(session.title || '')
      setKeywords(session.keywords || [])
      setKeywordInput('')
      
      // 기존 materials 배열이 있으면 사용, 없으면 이전 형식 변환
      if ((session as any).materials && Array.isArray((session as any).materials)) {
        setMaterials((session as any).materials.map((m: any) => ({
          id: Date.now().toString() + Math.random(),
          type: m.type,
          content: m.content,
          url: m.url,
          fileName: m.fileName,
          fileUrl: m.fileUrl,
          linkTitle: m.linkTitle
        })))
      } else {
        // 이전 형식 변환
        const convertedMaterials: Material[] = []
        if (session.materialText) {
          convertedMaterials.push({
            id: Date.now().toString(),
            type: 'text',
            content: session.materialText
          })
        }
        if (session.materialUrl) {
          convertedMaterials.push({
            id: Date.now().toString() + '1',
            type: 'youtube',
            url: session.materialUrl
          })
        }
        setMaterials(convertedMaterials)
      }
    }
  }, [session, isOpen])

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
    if (keywordInput.trim() && keywords.length < 3 && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }
  
  const validateMaterials = () => {
    for (const material of materials) {
      if (material.type === 'text' && !material.content?.trim()) {
        return false
      }
      if (material.type === 'youtube' && !material.url?.trim()) {
        return false
      }
      if (material.type === 'file' && !material.fileUrl) {
        return false
      }
      if (material.type === 'link') {
        if (!material.url?.trim()) {
          return false
        }
        if (!material.linkTitle?.trim()) {
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session) return
    
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
      const updateData = {
        sessionId: session.sessionId,
        title: sessionTitle.trim() || '제목 없음',
        materials: materials.map(material => ({
          type: material.type,
          content: material.content,
          url: material.url,
          fileName: material.fileName,
          fileUrl: material.fileUrl,
          linkTitle: material.linkTitle
        })),
        keywords
      }

      const response = await fetch('/api/sessions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('세션 수정에 실패했습니다.')
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('세션 수정 오류:', error)
      alert('세션 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">세션 수정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">학습 자료</h2>
            
            {/* 자료 목록 */}
            <div className="space-y-4 mb-4">
              {materials.map((material, index) => (
                <div key={material.id} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">
                      자료 {index + 1} - {material.type === 'text' ? '텍스트' : material.type === 'youtube' ? '유튜브 영상' : material.type === 'file' ? '파일' : '링크'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="https://example.com/article"
                          value={material.url || ''}
                          onChange={(e) => updateMaterial(material.id, { url: e.target.value })}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          신문 기사, 블로그, 웹 페이지 등의 링크를 입력하세요.
                        </p>
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
                          <p className="text-xs text-gray-500 mt-1">
                            지원 형식: PDF, DOC, DOCX, TXT, HWP (최대 10MB)
                          </p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드 (선택사항, 최대 3개)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="키워드를 입력하세요"
                disabled={keywords.length >= 3}
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim() || keywords.length >= 3}
                variant="secondary"
              >
                추가
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-2 hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !sessionTitle.trim() || materials.length === 0 || uploadingFiles.size > 0}
              className="flex-1"
            >
              {isLoading ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}