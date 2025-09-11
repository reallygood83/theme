/**
 * Feature Flag 컴포넌트
 * Phase 1: 토론 공유 기능을 안전하게 활성화/비활성화할 수 있는 래퍼
 * 
 * 사용법:
 * <FeatureFlag feature="sharing">
 *   <SharingComponent />
 * </FeatureFlag>
 */

import { ReactNode } from 'react';

interface FeatureFlagProps {
  children: ReactNode;
  feature: 'sharing' | 'community' | 'topics';
  fallback?: ReactNode;
  debug?: boolean;
}

/**
 * 환경변수 기반 Feature Flag 확인
 */
function checkFeatureEnabled(feature: string): boolean {
  switch (feature) {
    case 'sharing':
      return process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true';
    case 'community':
      return process.env.NEXT_PUBLIC_ENABLE_COMMUNITY === 'true';
    case 'topics':
      return process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true'; // 토론 주제는 sharing과 연동
    default:
      return false;
  }
}

/**
 * 개발 환경에서 디버그 정보 출력
 */
function logDebugInfo(feature: string, enabled: boolean): void {
  if (process.env.NEXT_PUBLIC_SHARING_DEBUG === 'true' && process.env.NODE_ENV === 'development') {
    console.log(`🚩 FeatureFlag: ${feature} = ${enabled ? '✅ 활성화' : '❌ 비활성화'}`);
  }
}

export default function FeatureFlag({ 
  children, 
  feature, 
  fallback = null, 
  debug = false 
}: FeatureFlagProps) {
  const isEnabled = checkFeatureEnabled(feature);
  
  // 디버그 모드에서 상태 로깅
  if (debug || process.env.NEXT_PUBLIC_SHARING_DEBUG === 'true') {
    logDebugInfo(feature, isEnabled);
  }
  
  // 기능이 비활성화된 경우
  if (!isEnabled) {
    // 개발 환경에서만 대체 UI 표시
    if (process.env.NODE_ENV === 'development' && fallback === null) {
      return (
        <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            🚧 <strong>{feature}</strong> 기능이 비활성화되어 있습니다.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            NEXT_PUBLIC_ENABLE_{feature.toUpperCase()}=true로 설정하세요.
          </p>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }
  
  // 기능이 활성화된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}

/**
 * Hook 형태로도 사용 가능
 */
export function useFeatureFlag(feature: 'sharing' | 'community' | 'topics'): boolean {
  return checkFeatureEnabled(feature);
}

/**
 * 개발자 도구 - 현재 모든 Feature Flag 상태 확인
 */
export function getFeatureStatus() {
  return {
    sharing: checkFeatureEnabled('sharing'),
    community: checkFeatureEnabled('community'),
    topics: checkFeatureEnabled('topics'),
    debug: process.env.NEXT_PUBLIC_SHARING_DEBUG === 'true',
    environment: process.env.NODE_ENV
  };
}

// 개발 환경에서 전역 접근 가능하도록 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).getFeatureStatus = getFeatureStatus;
}