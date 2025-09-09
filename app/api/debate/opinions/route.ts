import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Firebase 앱 초기화
if (!getApps().length) {
  initializeApp(firebaseConfig)
}

// 토론 의견 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '학생 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const opinionsRef = ref(db, 'debate-opinions')
    const studentOpinionsQuery = query(opinionsRef, orderByChild('studentId'), equalTo(studentId))
    
    const snapshot = await get(studentOpinionsQuery)
    const opinions: any[] = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        opinions.push({
          _id: childSnapshot.key,
          ...childSnapshot.val()
        })
      })
    }

    // 최신순으로 정렬
    opinions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    return NextResponse.json({
      success: true,
      data: { opinions }
    })

  } catch (error) {
    console.error('토론 의견 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 토론 의견 제출 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, content, studentName, studentId, classId, sessionCode } = body

    // 필수 필드 검증
    if (!topic || !content || !studentName || !studentId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const opinionsRef = ref(db, 'debate-opinions')
    const newOpinionRef = push(opinionsRef)

    const opinionData = {
      topic: topic.trim(),
      content: content.trim(),
      studentName,
      studentId,
      classId: classId || '',
      sessionCode: sessionCode || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      referenceCode: `DEBATE_${Date.now()}_${studentId.slice(-4)}`
    }

    await set(newOpinionRef, opinionData)

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      data: {
        _id: newOpinionRef.key,
        ...opinionData
      }
    })

  } catch (error) {
    console.error('토론 의견 제출 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}