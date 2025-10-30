import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, get, set, push, update } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const db = getDatabase()

// 랜덤 액세스 코드 생성 함수
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 혼동되기 쉬운 문자 제외 (I, L, O, 0, 1)
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    console.log('세션 가져오기 API 요청 시작')
    
    const { shareId, teacherId, teacherName } = await request.json()

    if (!shareId || !teacherId) {
      return NextResponse.json(
        { error: '필수 파라미터가 없습니다.' },
        { status: 400 }
      )
    }

    console.log('가져올 공유 세션 ID:', shareId)
    console.log('가져오는 교사 ID:', teacherId)

    // 공유된 세션 데이터 가져오기
    const sharedSessionRef = ref(db, `sharedSessions/${shareId}`)
    const sharedSessionSnapshot = await get(sharedSessionRef)

    if (!sharedSessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '공유 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sharedSessionData = sharedSessionSnapshot.val()
    console.log('공유 세션 데이터 조회 완료:', sharedSessionData.title || '제목없음')

    // 중복되지 않는 액세스 코드 생성
    let accessCode = generateAccessCode()
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      const existingSessionQuery = ref(db, 'sessions')
      const existingSessionSnapshot = await get(existingSessionQuery)
      
      if (existingSessionSnapshot.exists()) {
        const existingSessions = existingSessionSnapshot.val()
        const existingCodes = Object.values(existingSessions).map((session: any) => session.accessCode)
        
        if (!existingCodes.includes(accessCode)) {
          isUnique = true
        } else {
          accessCode = generateAccessCode()
          attempts++
        }
      } else {
        isUnique = true
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: '액세스 코드 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 새로운 세션 데이터 생성
    const newSessionData = {
      // 공유된 세션 데이터 복사
      title: `[복사] ${sharedSessionData.title}`,
      materialText: sharedSessionData.materialText,
      materialUrl: sharedSessionData.materialUrl,
      materials: sharedSessionData.materials || [],
      keywords: sharedSessionData.keywords || [],
      
      // 새로운 세션 정보
      teacherId: teacherId,
      teacherName: teacherName || '교사',
      accessCode: accessCode,
      createdAt: Date.now(),
      
      // 빈 데이터로 초기화
      questions: {},
      aiAnalysisResult: null,
      
      // 가져온 세션 메타데이터
      importedFrom: shareId,
      importedAt: Date.now()
    }

    // 새로운 세션 저장
    const newSessionRef = push(ref(db, 'sessions'))
    await set(newSessionRef, newSessionData)
    
    const newSessionId = newSessionRef.key
    console.log('새 세션 생성 완료, 세션 ID:', newSessionId)

    // 공유 세션의 가져오기 횟수 증가
    const importCountRef = ref(db, `sharedSessions/${shareId}/importCount`)
    const importCountSnapshot = await get(importCountRef)
    const currentImportCount = importCountSnapshot.val() || 0
    
    await update(ref(db, `sharedSessions/${shareId}`), {
      importCount: currentImportCount + 1
    })

    console.log('공유 세션 가져오기 횟수 증가 완료')

    return NextResponse.json({
      success: true,
      sessionId: newSessionId,
      accessCode: accessCode,
      message: '세션이 성공적으로 가져와졌습니다.'
    })

  } catch (error) {
    console.error('세션 가져오기 중 오류 발생:', error)
    return NextResponse.json(
      { error: '세션 가져오기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}