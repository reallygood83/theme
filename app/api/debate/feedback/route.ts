import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getOpinionModel from '@/lib/models/Opinion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// POST: AI 피드백 생성
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { opinionId, regenerate = false } = body;

    if (!opinionId) {
      return createErrorResponse('의견 ID가 필요합니다.');
    }

    const Opinion = getOpinionModel();
    const opinion = await Opinion.findById(opinionId)
      .populate('studentId', 'name')
      .populate('classId', 'name');

    if (!opinion) {
      return createErrorResponse('의견을 찾을 수 없습니다.', 404);
    }

    // 이미 AI 피드백이 있고 재생성이 아닌 경우
    if (opinion.aiFeedback && !regenerate) {
      return createSuccessResponse({
        opinion,
        feedback: opinion.aiFeedback
      }, '기존 AI 피드백을 반환합니다.');
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
당신은 초등학생을 위한 토론 교육 전문가입니다. 경기초등토론교육모형에 기반하여 다음 학생의 의견에 대해 건설적이고 격려적인 피드백을 제공해주세요.

**학생 정보:**
- 이름: ${opinion.studentName}
- 학급: ${opinion.studentClass}

**토론 주제:** ${opinion.topic}

**학생 의견:**
${opinion.content}

**피드백 작성 가이드라인:**
1. 친근하고 격려적인 톤으로 학생에게 직접 말하듯 작성
2. 학생의 좋은 점을 먼저 칭찬하고 인정
3. 의견의 논리적 구조나 근거를 분석
4. 다른 관점이나 추가적인 생각거리 제공
5. 구체적이고 실행 가능한 개선 제안
6. 토론에서 중요한 '다름을 존중'하는 자세 강조

**답변 형식:**
🌟 **잘한 점:**
[구체적인 칭찬과 인정]

🔍 **의견 분석:**
[논리적 구조, 근거의 강점과 특징]

💭 **생각해볼 점:**
[다른 관점이나 추가 고려사항]

✨ **성장 제안:**
[구체적이고 실행 가능한 개선 방향]

500자 내외로 작성해주세요.
`;

      const result = await model.generateContent(prompt);
      const aiFeedback = result.response.text();

      // 의견에 AI 피드백 저장
      opinion.aiFeedback = aiFeedback;
      opinion.status = 'feedback_given';
      await opinion.save();

      return createSuccessResponse({
        opinion,
        feedback: aiFeedback
      }, 'AI 피드백이 생성되었습니다.');

    } catch (error) {
      console.error('AI 피드백 생성 오류:', error);
      return createErrorResponse('AI 피드백 생성 중 오류가 발생했습니다.', 500);
    }
  });
}

// GET: 특정 의견의 피드백 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const opinionId = searchParams.get('opinionId');

    if (!opinionId) {
      return createErrorResponse('의견 ID가 필요합니다.');
    }

    const Opinion = getOpinionModel();
    const opinion = await Opinion.findById(opinionId)
      .populate('studentId', 'name groupName')
      .populate('classId', 'name code');

    if (!opinion) {
      return createErrorResponse('의견을 찾을 수 없습니다.', 404);
    }

    return createSuccessResponse({
      opinion,
      aiFeedback: opinion.aiFeedback,
      teacherFeedback: opinion.teacherFeedback,
      hasAIFeedback: !!opinion.aiFeedback,
      hasTeacherFeedback: !!opinion.teacherFeedback
    });
  });
}