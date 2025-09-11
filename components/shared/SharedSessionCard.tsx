/**
 * 공유 세션 카드 컴포넌트
 * Phase 1: shadcn/ui 컴포넌트를 활용한 기본 UI
 * 
 * ⚠️ 기존 Card 컴포넌트를 재사용하여 일관성 보장
 */

import { SharedSession } from '@/lib/shared-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Download, Heart, Clock, User } from 'lucide-react';

interface SharedSessionCardProps {
  session: SharedSession;
  onView?: (sessionId: string) => void;
  onImport?: (sessionId: string) => void;
  onLike?: (sessionId: string) => void;
  showActions?: boolean;
}

/**
 * 날짜 포맷팅 유틸리티
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return '방금 전';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}시간 전`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * 카테고리별 색상 매핑
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    science: 'bg-blue-100 text-blue-800',
    social: 'bg-green-100 text-green-800',
    korean: 'bg-purple-100 text-purple-800',
    math: 'bg-orange-100 text-orange-800',
    etc: 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors.etc;
}

/**
 * 학년별 색상 매핑
 */
function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    '초등': 'bg-yellow-100 text-yellow-800',
    '중등': 'bg-cyan-100 text-cyan-800',
    '고등': 'bg-pink-100 text-pink-800'
  };
  return colors[grade] || colors['중등'];
}

export default function SharedSessionCard({ 
  session, 
  onView, 
  onImport, 
  onLike, 
  showActions = true 
}: SharedSessionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {session.teacherName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 truncate">
                {session.title}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <User className="h-3 w-3" />
                <span>{session.teacherName}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{formatDate(session.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 설명 */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
          {session.description}
        </p>
        
        {/* 카테고리 및 학년 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getCategoryColor(session.category)}>
            {session.category}
          </Badge>
          <Badge className={getGradeColor(session.targetGrade)}>
            {session.targetGrade}
          </Badge>
          {session.shareType === 'restricted' && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              제한 공유
            </Badge>
          )}
        </div>
        
        {/* 태그 */}
        {session.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {session.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {session.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{session.tags.length - 3}개
              </span>
            )}
          </div>
        )}
        
        {/* 학습 자료 미리보기 */}
        {session.materials.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">학습 자료:</span>
              <span>{session.materials.length}개</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {session.materials.slice(0, 2).map(material => material.title).join(', ')}
              {session.materials.length > 2 && ` 외 ${session.materials.length - 2}개`}
            </div>
          </div>
        )}
        
        {/* 통계 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{session.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{session.importCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{session.likeCount}</span>
            </div>
          </div>
          
          {/* 액션 버튼들 */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(session.id!)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                상세보기
              </Button>
              <Button
                size="sm"
                onClick={() => onImport?.(session.id!)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                가져오기
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}