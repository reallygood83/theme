'use client';

/**
 * 세션 공유 모달 컴포넌트
 * Phase 2: 교사가 토론 세션을 다른 교사들과 공유할 수 있는 전문적인 UI
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, BookOpen, Users, Globe, Lock, Check, AlertTriangle } from 'lucide-react';
// Using browser alert for notifications (avoiding external dependencies)

interface SessionMaterial {
  id: string;
  type: 'text' | 'youtube' | 'link' | 'file';
  title: string;
  content: string;
  url?: string;
}

interface SessionData {
  id: string;
  title: string;
  description: string;
  materials: SessionMaterial[];
  teacherName?: string;
}

interface ShareSessionModalProps {
  session: SessionData;
  trigger?: React.ReactNode;
  onShareSuccess?: (sharedSessionId: string) => void;
}

export function ShareSessionModal({ session, trigger, onShareSuccess }: ShareSessionModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareType, setShareType] = useState<'public' | 'restricted'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('general');
  const [targetGrade, setTargetGrade] = useState<'초등' | '중등' | '고등'>('중등');
  const [isOpen, setIsOpen] = useState(false);

  // 미리 정의된 태그 옵션
  const availableTags = [
    '토론', '논증', '의사소통', '비판적사고',
    '환경', '과학', '사회', '역사', '문학',
    'AI', '기술', '미래', '윤리', '인권'
  ];

  // 카테고리 옵션
  const categories = [
    { value: 'general', label: '일반 토론', icon: Users },
    { value: 'science', label: '과학 기술', icon: BookOpen },
    { value: 'social', label: '사회 문화', icon: Globe },
    { value: 'ethics', label: '윤리 철학', icon: AlertTriangle }
  ];

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag].slice(0, 5) // 최대 5개
    );
  };

  const handleShare = async () => {
    if (!session) return;

    setIsSharing(true);
    
    try {
      // 30-Second Reality Check: 실제 API 호출
      const response = await fetch('/api/shared/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalSessionId: session.id,
          title: session.title,
          description: session.description,
          materials: session.materials,
          shareType,
          tags,
          category,
          targetGrade
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '공유에 실패했습니다.');
      }

      alert('✅ 세션이 성공적으로 공유되었습니다!');

      setIsOpen(false);
      onShareSuccess?.(result.sharedSessionId);
      
    } catch (error) {
      console.error('세션 공유 오류:', error);
      alert(`❌ 공유에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSharing(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '🎥';
      case 'link': return '🔗';
      case 'file': return '📁';
      default: return '📝';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            토론 세션 공유
          </DialogTitle>
          <DialogDescription>
            다른 교사들과 이 토론 세션을 공유하여 교육 자료로 활용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 세션 정보 미리보기 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{session.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {session.materials.length}개 자료
                </Badge>
              </div>
              
              {/* 학습 자료 목록 */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">포함될 학습 자료:</h4>
                {session.materials.map((material) => (
                  <div key={material.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="text-lg">{getMaterialIcon(material.type)}</span>
                    <span className="font-medium">{material.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 공유 설정 */}
          <div className="space-y-4">
            <h3 className="font-semibold">공유 설정</h3>
            
            {/* 공유 유형 */}
            <div>
              <label className="block text-sm font-medium mb-2">공유 범위</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShareType('public')}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                    shareType === 'public' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <div>
                    <div className="font-medium">전체 공개</div>
                    <div className="text-xs text-gray-600">모든 교사가 볼 수 있습니다</div>
                  </div>
                  {shareType === 'public' && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShareType('restricted')}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                    shareType === 'restricted' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">제한 공개</div>
                    <div className="text-xs text-gray-600">승인된 교사만 볼 수 있습니다</div>
                  </div>
                  {shareType === 'restricted' && <Check className="h-4 w-4 text-blue-600 ml-auto" />}
                </button>
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 p-2 border rounded transition-colors ${
                        category === cat.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 대상 학년 */}
            <div>
              <label className="block text-sm font-medium mb-2">대상 학년</label>
              <div className="flex gap-2">
                {(['초등', '중등', '고등'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setTargetGrade(grade)}
                    className={`px-3 py-2 border rounded transition-colors ${
                      targetGrade === grade 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* 태그 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                태그 (최대 5개)
                <span className="text-xs text-gray-500 ml-2">{tags.length}/5</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    disabled={!tags.includes(tag) && tags.length >= 5}
                    className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                      tags.includes(tag)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 disabled:opacity-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 개인정보 보호 안내 */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">개인정보 보호</p>
                  <p className="text-yellow-700 mt-1">
                    학생 질문, 이름, 개인 정보는 공유되지 않습니다. 
                    세션 제목과 학습 자료만 다른 교사들과 공유됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSharing}
            >
              취소
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  공유 중...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  공유하기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}