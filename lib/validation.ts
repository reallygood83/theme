// 입력 데이터 검증 유틸리티

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 학생 정보 검증
export function validateStudentInfo(studentName: string, studentClass: string): ValidationResult {
  const errors: string[] = [];

  if (!studentName || studentName.trim().length === 0) {
    errors.push('학생 이름을 입력해주세요.');
  } else if (studentName.trim().length < 2) {
    errors.push('학생 이름은 2글자 이상이어야 합니다.');
  } else if (studentName.trim().length > 20) {
    errors.push('학생 이름은 20글자를 초과할 수 없습니다.');
  }

  if (!studentClass || studentClass.trim().length === 0) {
    errors.push('학급 정보를 입력해주세요.');
  } else if (studentClass.trim().length > 10) {
    errors.push('학급 정보는 10글자를 초과할 수 없습니다.');
  }

  // 특수문자 검증 (기본적인 한글, 영어, 숫자만 허용)
  const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
  if (studentName && !nameRegex.test(studentName)) {
    errors.push('이름에는 한글, 영어, 숫자만 입력할 수 있습니다.');
  }

  const classRegex = /^[가-힣a-zA-Z0-9\s\-]+$/;
  if (studentClass && !classRegex.test(studentClass)) {
    errors.push('학급 정보에는 한글, 영어, 숫자, 하이픈만 입력할 수 있습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 토론 의견 검증
export function validateOpinion(topic: string, content: string): ValidationResult {
  const errors: string[] = [];

  if (!topic || topic.trim().length === 0) {
    errors.push('토론 주제를 입력해주세요.');
  } else if (topic.trim().length < 5) {
    errors.push('토론 주제는 5글자 이상이어야 합니다.');
  } else if (topic.trim().length > 100) {
    errors.push('토론 주제는 100글자를 초과할 수 없습니다.');
  }

  if (!content || content.trim().length === 0) {
    errors.push('토론 의견을 입력해주세요.');
  } else if (content.trim().length < 10) {
    errors.push('토론 의견은 10글자 이상이어야 합니다.');
  } else if (content.trim().length > 1000) {
    errors.push('토론 의견은 1000글자를 초과할 수 없습니다.');
  }

  // 부적절한 단어 필터링 (기본적인 예시)
  const inappropriateWords = ['욕설1', '비속어1', '부적절1']; // 실제 환경에서는 더 포괄적인 리스트 사용
  const combinedText = `${topic} ${content}`.toLowerCase();
  
  for (const word of inappropriateWords) {
    if (combinedText.includes(word)) {
      errors.push('부적절한 표현이 포함되어 있습니다. 다시 작성해주세요.');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 교사 피드백 검증
export function validateTeacherFeedback(feedback: string): ValidationResult {
  const errors: string[] = [];

  if (!feedback || feedback.trim().length === 0) {
    errors.push('피드백을 입력해주세요.');
  } else if (feedback.trim().length < 5) {
    errors.push('피드백은 5글자 이상이어야 합니다.');
  } else if (feedback.trim().length > 2000) {
    errors.push('피드백은 2000글자를 초과할 수 없습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// SQL 인젝션 방지를 위한 기본 검사
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // 기본적인 XSS 방지
    .replace(/['";]/g, '') // SQL 인젝션 방지
    .substring(0, 2000); // 길이 제한
}

// Firebase UID 검증
export function validateFirebaseUid(uid: string): boolean {
  return uid && uid.length > 0 && uid.length <= 128;
}