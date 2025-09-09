'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InteractiveMermaidProps {
  chart: string;
  title?: string;
  description?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'colorful';
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
}

export default function InteractiveMermaid({ 
  chart, 
  title, 
  description, 
  theme = 'colorful',
  className = '', 
  interactive = true,
  showControls = true
}: InteractiveMermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);

  const themes = {
    default: {
      theme: 'default',
      primaryColor: '#0ea5e9',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#0ea5e9',
      lineColor: '#6b7280',
      secondaryColor: '#f3f4f6',
      tertiaryColor: '#ffffff'
    },
    dark: {
      theme: 'dark',
      primaryColor: '#3b82f6',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#3b82f6',
      lineColor: '#64748b',
      secondaryColor: '#1e293b',
      tertiaryColor: '#0f172a'
    },
    forest: {
      theme: 'forest',
      primaryColor: '#10b981',
      primaryTextColor: '#065f46',
      primaryBorderColor: '#10b981',
      lineColor: '#6b7280',
      secondaryColor: '#ecfdf5',
      tertiaryColor: '#ffffff'
    },
    neutral: {
      theme: 'neutral',
      primaryColor: '#6b7280',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#6b7280',
      lineColor: '#9ca3af',
      secondaryColor: '#f9fafb',
      tertiaryColor: '#ffffff'
    },
    colorful: {
      theme: 'base',
      primaryColor: '#8b5cf6',
      primaryTextColor: '#1f2937',
      primaryBorderColor: '#8b5cf6',
      lineColor: '#6b7280',
      secondaryColor: '#faf5ff',
      tertiaryColor: '#ffffff'
    }
  };

  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current && chart) {
        try {
          setIsLoaded(false);
          
          // 동적으로 mermaid 라이브러리 로드
          const mermaid = (await import('mermaid')).default;
          
          // Mermaid 초기화 with enhanced configuration
          mermaid.initialize({
            startOnLoad: false,
            theme: themes[currentTheme].theme,
            securityLevel: 'loose',
            fontFamily: '"Inter", "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
              nodeSpacing: 100,
              rankSpacing: 100,
              diagramPadding: 20
            },
            sequence: {
              diagramMarginX: 50,
              diagramMarginY: 10,
              actorMargin: 50,
              width: 150,
              height: 65,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35
            },
            gantt: {
              titleTopMargin: 25,
              barHeight: 20,
              fontSize: 11,
              sidePadding: 75,
              gridLineStartPadding: 35,
              bottomPadding: 25
            },
            themeVariables: themes[currentTheme]
          });

          // 기존 내용 제거
          ref.current.innerHTML = '';
          
          // 고유 ID 생성
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Mermaid 다이어그램 렌더링
          const { svg } = await mermaid.render(id, chart);
          
          if (ref.current) {
            ref.current.innerHTML = svg;
            
            // 인터랙티브 기능 추가
            if (interactive) {
              const svgElement = ref.current.querySelector('svg');
              if (svgElement) {
                // 호버 효과 추가
                const nodes = svgElement.querySelectorAll('.node, .flowchart-label, .actor');
                nodes.forEach((node, index) => {
                  const element = node as HTMLElement;
                  element.style.transition = 'all 0.3s ease';
                  element.style.cursor = 'pointer';
                  
                  element.addEventListener('mouseenter', () => {
                    element.style.transform = 'scale(1.05)';
                    element.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))';
                  });
                  
                  element.addEventListener('mouseleave', () => {
                    element.style.transform = 'scale(1)';
                    element.style.filter = 'none';
                  });
                  
                  element.addEventListener('click', () => {
                    // 클릭 애니메이션
                    element.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                      element.style.transform = 'scale(1.05)';
                    }, 150);
                    
                    // 선택적: 클릭 이벤트 콜백
                    console.log(`Clicked node ${index + 1}`);
                  });
                });

                // 화살표와 연결선에 애니메이션 효과
                const edges = svgElement.querySelectorAll('.flowchart-link, .edge');
                edges.forEach((edge) => {
                  const element = edge as HTMLElement;
                  element.style.transition = 'all 0.3s ease';
                  element.addEventListener('mouseenter', () => {
                    element.style.strokeWidth = '3px';
                    element.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
                  });
                  element.addEventListener('mouseleave', () => {
                    element.style.strokeWidth = '2px';
                    element.style.filter = 'none';
                  });
                });
              }
            }
            
            setIsLoaded(true);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="flex items-center justify-center p-8 text-center">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                  <div class="text-red-600 text-lg mb-2">⚠️ 다이어그램 렌더링 오류</div>
                  <div class="text-red-500 text-sm">${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}</div>
                </div>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [chart, currentTheme, interactive]);

  const handleThemeChange = (newTheme: typeof theme) => {
    setCurrentTheme(newTheme);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className}`}>
      {(title || description || showControls) && (
        <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            
            {showControls && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Theme Selector */}
                <div className="flex gap-1">
                  {Object.keys(themes).map((themeName) => (
                    <Button
                      key={themeName}
                      variant={currentTheme === themeName ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleThemeChange(themeName as typeof theme)}
                      className="text-xs px-2 py-1"
                    >
                      {themeName === 'default' && '🔵'}
                      {themeName === 'dark' && '🌙'}
                      {themeName === 'forest' && '🌲'}
                      {themeName === 'neutral' && '⚫'}
                      {themeName === 'colorful' && '🌈'}
                    </Button>
                  ))}
                </div>
                
                {/* Zoom Controls */}
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>🔍−</Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>⚪</Button>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>🔍+</Button>
                </div>
                
                {/* Fullscreen Toggle */}
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? '🗗' : '🗖'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              <span className="text-sm">다이어그램 렌더링 중...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={ref} 
          className={`mermaid-diagram transition-all duration-300 p-6 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: isFullscreen ? '60vh' : '300px',
            background: currentTheme === 'dark' ? '#0f172a' : 'transparent'
          }}
        />
        
        {/* Interactive Badge */}
        {interactive && isLoaded && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs"
          >
            🖱️ Interactive
          </Badge>
        )}
      </div>
      
      {isFullscreen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={toggleFullscreen} />
      )}
    </Card>
  );
}