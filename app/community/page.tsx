/**
 * 커뮤니티 메인 페이지 (Phase 1)
 * 토론 공유 기능의 기본 인프라 테스트용 페이지
 * 
 * ⚠️ Feature Flag로 제어되며, 비활성화 시 접근 불가
 */

'use client';

import { useEffect, useState } from 'react';
import FeatureFlag, { getFeatureStatus } from '@/components/shared/FeatureFlag';
import SharedSessionCard from '@/components/shared/SharedSessionCard';
import { SharedSession } from '@/lib/shared-db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Settings, Database, Wifi } from 'lucide-react';

export default function CommunityPage() {
  const [featureStatus, setFeatureStatus] = useState<any>(null);
  const [testSessions, setTestSessions] = useState<SharedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Feature Flag 상태 확인
    setFeatureStatus(getFeatureStatus());
  }, []);

  /**
   * Phase 1 테스트 데이터 로드
   */
  const loadTestData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shared/sessions?limit=6');
      const data = await response.json();
      
      if (response.ok) {
        setTestSessions(data.data || []);
      } else {
        console.error('테스트 데이터 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Phase 1 테스트 세션 생성
   */
  const createTestSession = async () => {
    try {
      const testData = {
        originalSessionId: `test_${Date.now()}`,
        title: `Phase 1 테스트 세션 - ${new Date().toLocaleString()}`,
        description: '토론 공유 기능 Phase 1 인프라 테스트를 위한 샘플 세션입니다.',
        category: 'science',
        targetGrade: '중등',
        materials: [
          {
            id: 'material_1',
            type: 'text',
            title: 'Phase 1 테스트 자료',
            content: '기본 인프라 테스트용 학습 자료입니다.'
          }
        ],
        tags: ['Phase1', '테스트', 'API'],
        shareType: 'public'
      };

      const response = await fetch('/api/shared/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ 테스트 세션 생성 성공!\nSession ID: ${result.sessionId}`);
        loadTestData(); // 목록 새로고침
      } else {
        alert(`❌ 테스트 세션 생성 실패:\n${result.error}`);
      }
    } catch (error) {
      alert(`❌ API 호출 실패:\n${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            커뮤니티 (Phase 1 테스트)
          </h1>
          <p className="text-gray-600">
            토론 공유 기능의 기본 인프라를 테스트하는 페이지입니다.
          </p>
        </div>

        <FeatureFlag feature="sharing">
          <div className="space-y-8">
            {/* Phase 1 상태 대시보드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Phase 1 개발 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featureStatus && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Badge variant={featureStatus.sharing ? "default" : "secondary"}>
                        공유 기능
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {featureStatus.sharing ? '활성화' : '비활성화'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge variant={featureStatus.community ? "default" : "secondary"}>
                        커뮤니티
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {featureStatus.community ? '활성화' : '비활성화'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge variant={featureStatus.debug ? "default" : "secondary"}>
                        디버그 모드
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {featureStatus.debug ? '활성화' : '비활성화'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge variant={featureStatus.environment === 'development' ? "default" : "secondary"}>
                        개발 환경
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {featureStatus.environment}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 테스트 액션 버튼들 */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button onClick={loadTestData} disabled={isLoading} variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    {isLoading ? '로딩 중...' : '데이터 로드'}
                  </Button>
                  <Button onClick={createTestSession} variant="default">
                    <Wifi className="h-4 w-4 mr-2" />
                    테스트 세션 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 공유 콘텐츠 탭 */}
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">공유 세션</TabsTrigger>
                <TabsTrigger value="topics">공유 주제 (Phase 3)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sessions" className="space-y-6">
                {testSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testSessions.map((session) => (
                      <SharedSessionCard
                        key={session.id}
                        session={session}
                        onView={(id) => alert(`세션 상세보기: ${id}`)}
                        onImport={(id) => alert(`세션 가져오기: ${id}`)}
                        onLike={(id) => alert(`세션 좋아요: ${id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        공유된 세션이 없습니다
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Phase 1 테스트를 위해 테스트 세션을 생성해보세요.
                      </p>
                      <Button onClick={createTestSession}>
                        테스트 세션 생성하기
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="topics" className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Phase 3에서 구현 예정
                    </h3>
                    <p className="text-gray-600">
                      공유 주제 기능은 Phase 3에서 구현됩니다.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </FeatureFlag>
      </div>
    </div>
  );
}