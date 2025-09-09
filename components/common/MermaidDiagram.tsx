'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Mermaid 초기화
      mermaid.initialize({
        startOnLoad: true,
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
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      // Mermaid 다이어그램 렌더링
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded">다이어그램 렌더링 오류: ${error.message}</div>`;
        }
      });
    }
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