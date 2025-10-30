'use client';

/**
 * 기존 SessionList와 새로운 ShareSessionModal을 연결하는 어댑터 컴포넌트
 * Phase 2: Zero-Impact 원칙에 따라 기존 코드 수정 없이 새 기능 통합
 */

import React from 'react';
import { ShareSessionModal } from './ShareSessionModal';
import { Session } from '@/lib/utils';

interface ShareSessionAdapterProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export default function ShareSessionAdapter({ 
  session, 
  isOpen, 
  onClose, 
  onShareSuccess 
}: ShareSessionAdapterProps) {
  if (!session || !isOpen) return null;

  // Session 타입을 ShareSessionModal의 SessionData 타입으로 변환
  const adaptedSession = {
    id: session.sessionId,
    title: session.title || '제목 없음',
    description: session.materialText || '',
    materials: session.materials && session.materials.length > 0 
      ? session.materials.map((material, index) => ({
          id: `material_${index + 1}`,
          type: material.type,
          title: material.fileName || material.content?.substring(0, 50) || `${material.type} 자료 ${index + 1}`,
          content: material.content || material.fileName || '',
          url: material.url
        }))
      : [
          // 레거시 데이터를 위한 폴백: 기존 필드에서 자료 추출
          // 텍스트 자료
          ...(session.materialText ? [{
            id: 'text_material',
            type: 'text' as const,
            title: '학습 자료 텍스트',
            content: session.materialText
          }] : []),
          
          // YouTube 자료 (materialUrl이 YouTube 링크인 경우)
          ...(session.materialUrl && session.materialUrl.includes('youtube.com') ? [{
            id: 'youtube_material',
            type: 'youtube' as const,
            title: 'YouTube 영상',
            content: 'YouTube 영상',
            url: session.materialUrl
          }] : [])
        ],
    teacherName: '교사'
  };

  const handleShareSuccess = (sharedSessionId: string) => {
    console.log('✅ 세션 공유 성공:', { sharedSessionId, originalSessionId: session.sessionId });
    onShareSuccess?.();
    onClose();
  };

  return (
    <ShareSessionModal
      session={adaptedSession}
      trigger={null} // 외부에서 제어되므로 트리거 없음
      isOpen={isOpen}
      onClose={onClose}
      onShareSuccess={handleShareSuccess}
    />
  );
}