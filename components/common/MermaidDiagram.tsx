'use client';

import { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current && chart) {
        try {
          // 동적으로 mermaid 라이브러리 로드
          const mermaid = (await import('mermaid')).default;
          
          // Mermaid 초기화
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            fontSize: 16,
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
              nodeSpacing: 80,
              rankSpacing: 80
            }
          });

          // 기존 내용 제거
          ref.current.innerHTML = '';
          
          // 고유 ID 생성
          const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Mermaid 다이어그램 렌더링
          const { svg } = await mermaid.render(id, chart);
          
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">⚠️ 다이어그램 렌더링 오류<br/><small class="text-xs">${error instanceof Error ? error.message : '알 수 없는 오류'}</small></div>`;
          }
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className={`mermaid-diagram ${className}`}
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '200px'
      }}
    />
  );
}