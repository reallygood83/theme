import { NextResponse } from 'next/server'
import { database, getFirebaseDatabase } from '@/lib/firebase'
import { ref, update } from 'firebase/database'

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/sessions/update 요청 시작')
    
    const data = await request.json()
    console.log('요청 데이터:', JSON.stringify(data, null, 2))
    
    const { sessionId, ...updateData } = data
    
    // 필수 필드 검증
    if (!sessionId) {
      console.log('오류: 세션 ID 누락')
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 요청 데이터 검증
    if (!updateData.title && !updateData.materials && !updateData.materialText) {
      console.log('오류: 업데이트할 데이터가 없음')
      return NextResponse.json(
        { error: '업데이트할 데이터가 없습니다.' }, 
        { status: 400 }
      )
    }

    // 업데이트할 데이터 준비
    const sessionUpdateData: any = {
      title: updateData.title || '제목 없음',
      keywords: updateData.keywords || [],
      updatedAt: Date.now()
    }
    
    // materials 배열이 있으면 사용, 없으면 이전 형식 사용
    if (updateData.materials && Array.isArray(updateData.materials)) {
      sessionUpdateData.materials = updateData.materials
      // 이전 형식 필드 제거
      sessionUpdateData.materialText = null
      sessionUpdateData.materialUrl = null
    } else {
      // 이전 형식 유지 (backward compatibility)
      sessionUpdateData.materialText = updateData.materialText || ''
      sessionUpdateData.materialUrl = updateData.materialUrl || ''
    }
    
    console.log('업데이트 데이터 준비 완료:', {
      sessionId,
      hasTitle: !!sessionUpdateData.title,
      hasMaterials: !!sessionUpdateData.materials,
      materialsCount: sessionUpdateData.materials?.length || 0,
      hasKeywords: !!sessionUpdateData.keywords,
      keywordsCount: sessionUpdateData.keywords?.length || 0
    })
    
    // Firebase Database 인스턴스 확인
    const db = getFirebaseDatabase()
    
    if (!db) {
      console.log('오류: Firebase Database 초기화 실패')
      return NextResponse.json(
        { error: 'Firebase Database 연결에 실패했습니다.' }, 
        { status: 500 }
      )
    }
    
    // 세션 업데이트
    const sessionRef = ref(db, `sessions/${sessionId}`)
    
    console.log('세션 수정 시도:', {
      sessionId,
      updateData: sessionUpdateData
    })
    
    await update(sessionRef, sessionUpdateData)
    
    console.log('세션 수정 완료:', sessionId)
    
    return NextResponse.json({ 
      success: true,
      message: '세션이 성공적으로 수정되었습니다.'
    })
  } catch (error) {
    console.error('세션 수정 오류 상세:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Firebase 특정 에러 처리
    let errorMessage = '세션 수정에 실패했습니다.'
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = 'Firebase 권한이 없습니다.'
      } else if (error.message.includes('network')) {
        errorMessage = '네트워크 연결에 문제가 있습니다.'
      } else if (error.message.includes('auth')) {
        errorMessage = 'Firebase 인증에 실패했습니다.'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}