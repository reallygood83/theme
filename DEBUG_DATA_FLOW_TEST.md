# 토론 의견 데이터 흐름 디버깅 테스트 가이드

## 문제 상황
- 학생이 "토론 의견 제출"에서 제출한 의견이 교사 대시보드의 "교사 토론 관리"에서 보이지 않음
- 하지만 다른 "토론 의견 목록"에서는 보임

## 검증된 코드 분석 결과

### 1. Firebase 경로 일관성 ✅
모든 컴포넌트가 동일한 Firebase 경로 사용:
```
sessions/${sessionId}/debateOpinions
```

### 2. 컴포넌트 연결 ✅ 
- 학생: `DebateOpinionInput` → sessionId 정확히 전달됨
- 교사: `DebateOpinionManager` → sessionId 정확히 전달됨

### 3. 개선된 디버깅 코드 ✅
- `DebateOpinionInput`: 동적 논제 로딩, 데이터 검증 추가
- `DebateOpinionManager`: 상세 로깅 추가

## 다음 테스트 단계

### 1. 실제 데이터 흐름 테스트
1. 학생 페이지로 이동하여 토론 의견 제출
2. 브라우저 콘솔에서 로그 확인:
   ```
   🔥 토론 의견 제출 시작
   📝 제출할 데이터
   💾 Firebase 저장 시도
   ✅ 검증 완료 - 데이터가 Firebase에 정상 저장됨
   ```

3. 교사 대시보드로 이동하여 로그 확인:
   ```
   🔍 토론 의견 데이터 조회 시작
   📡 Firebase 실시간 업데이트
   ```

### 2. 잠재적 원인 체크리스트
- [ ] sessionId 값이 학생/교사 페이지에서 동일한가?
- [ ] Firebase 실시간 리스너가 정상 작동하는가?
- [ ] 제출된 데이터가 실제로 Firebase에 저장되는가?
- [ ] 교사 페이지의 실시간 업데이트가 작동하는가?

### 3. 추가 디버깅이 필요한 경우
Firebase Console에서 직접 데이터 확인:
```
sessions/
  └── [sessionId]/
      └── debateOpinions/
          └── [opinionId]: {
              sessionId: "...",
              studentName: "...",
              studentGroup: "...",
              selectedAgenda: "...",
              position: "agree|disagree",
              opinionText: "...",
              createdAt: timestamp
            }
```

## 예상 결과
모든 로깅이 정상이면 학생 제출 의견이 교사 대시보드에 즉시 표시되어야 함.