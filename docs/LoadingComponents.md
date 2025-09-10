# Loading Components Documentation

## Overview

Professional loading modal components and animations designed to reduce user anxiety during AI generation processes. These components provide clear progress indication with smooth animations and appropriate messaging for different phases of processing.

## Components

### 1. LoadingModal

**Purpose**: Full-screen modal for long-running AI processes (5-30 seconds)

**Features**:
- Multi-stage progress indication
- Step-by-step animation
- Progress percentage display
- Dynamic loading messages
- Professional design with smooth animations

**Usage**:
```tsx
import LoadingModal from '@/components/common/LoadingModal'

<LoadingModal 
  isOpen={loading && loadingType !== null} 
  type="topic-recommendation" // or "scenario-generation"
/>
```

**Types**:
- `topic-recommendation`: For AI topic recommendation (4 stages, ~9 seconds)
- `scenario-generation`: For AI scenario generation (5 stages, ~15 seconds)

### 2. LoadingSpinner

**Purpose**: Versatile spinner component for various loading states

**Features**:
- Multiple sizes (sm, md, lg)
- Color variants (primary, secondary, white)
- Progress display option
- Animated dots in text
- Customizable duration

**Usage**:
```tsx
import LoadingSpinner from '@/components/common/LoadingSpinner'

<LoadingSpinner 
  size="lg"
  color="primary"
  message="데이터 로딩 중"
  showProgress={true}
  duration={5000}
/>
```

### 3. PulseLoader

**Purpose**: Simple pulse animation for inline loading

**Usage**:
```tsx
import { PulseLoader } from '@/components/common/LoadingSpinner'

<PulseLoader text="처리 중" />
```

### 4. IconSpinner

**Purpose**: Rotating icon with text for themed loading

**Usage**:
```tsx
import { IconSpinner } from '@/components/common/LoadingSpinner'

<IconSpinner 
  icon="🎯" 
  text="AI 분석 중..."
/>
```

### 5. LoadingOverlay

**Purpose**: Full-screen overlay for medium-duration tasks (1-5 seconds)

**Features**:
- Backdrop blur effect
- Multiple animation types
- Customizable messages
- Optional overlay mode

**Usage**:
```tsx
import LoadingOverlay from '@/components/common/LoadingOverlay'

<LoadingOverlay
  isVisible={loading}
  message="데이터를 처리하고 있습니다"
  submessage="잠시만 기다려주세요..."
  type="spinner"
/>
```

### 6. InlineLoading

**Purpose**: Small loading indicator for buttons and inline use

**Usage**:
```tsx
import { InlineLoading } from '@/components/common/LoadingOverlay'

<Button disabled={loading}>
  {loading ? (
    <InlineLoading text="저장 중" size="sm" />
  ) : (
    '데이터 저장'
  )}
</Button>
```

### 7. LoadingSkeleton

**Purpose**: Placeholder animation while content loads

**Usage**:
```tsx
import { LoadingSkeleton } from '@/components/common/LoadingOverlay'

{loading ? (
  <LoadingSkeleton lines={3} />
) : (
  <ContentComponent />
)}
```

## Implementation Guide

### 1. AI Generation Processes

For AI topic recommendation and scenario generation:

```tsx
const [loading, setLoading] = useState(false)
const [loadingType, setLoadingType] = useState<'topic-recommendation' | 'scenario-generation' | null>(null)

const handleAIGeneration = async (type: 'topic-recommendation' | 'scenario-generation') => {
  setLoading(true)
  setLoadingType(type)
  
  try {
    // API call
  } finally {
    setLoading(false)
    setLoadingType(null)
  }
}

return (
  <>
    <LoadingModal 
      isOpen={loading && loadingType !== null} 
      type={loadingType || 'topic-recommendation'}
    />
    {/* Your main content */}
  </>
)
```

### 2. Button Loading States

For interactive elements:

```tsx
<Button 
  onClick={handleAction}
  disabled={loading}
>
  {loading ? (
    <PulseLoader text="처리 중" />
  ) : (
    '작업 실행'
  )}
</Button>
```

### 3. Content Loading

For content areas:

```tsx
<div className="content-area">
  {loading ? (
    <LoadingSkeleton lines={4} />
  ) : (
    <ActualContent />
  )}
</div>
```

## Design Principles

### 1. User Experience
- **Reduce Anxiety**: Clear progress indication tells users the system is working
- **Set Expectations**: Time estimates and stage descriptions
- **Professional Look**: Polished animations maintain trust

### 2. Performance
- **Lightweight**: Minimal overhead on rendering
- **Smooth Animations**: 60fps animations using CSS transforms
- **Memory Efficient**: Proper cleanup of intervals and timeouts

### 3. Accessibility
- **Screen Reader Support**: Appropriate ARIA labels
- **Reduced Motion**: Respect user preferences
- **Keyboard Navigation**: Focus management during loading states

## Animation Timing

### LoadingModal Stages
- **Topic Recommendation**: 9 seconds total
  - Analyzing (2s) → Searching (3s) → Evaluating (2.5s) → Generating (1.5s)
  
- **Scenario Generation**: 15 seconds total
  - Preparing (3s) → Researching (4s) → Arguments (3.5s) → Questions (2.5s) → Finalizing (2s)

### Spinner Animations
- **Rotation Speed**: 1 second per rotation
- **Progress Updates**: Every 100ms
- **Dots Animation**: 500ms intervals

## Customization

### Colors
```css
/* Primary theme */
--primary-color: #3B82F6;
--secondary-color: #8B5CF6;

/* Loading states */
--loading-bg: rgba(0, 0, 0, 0.6);
--modal-bg: white;
--progress-bg: #E5E7EB;
```

### Animations
```css
/* Spin animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Bounce animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); }
}
```

## Integration Examples

### Teacher Dashboard
```tsx
// In DebateScenarioModal.tsx
import LoadingModal from '@/components/common/LoadingModal'
import { PulseLoader } from '@/components/common/LoadingSpinner'

// State management
const [loading, setLoading] = useState(false)
const [loadingType, setLoadingType] = useState<'topic-recommendation' | 'scenario-generation' | null>(null)

// Usage in render
<LoadingModal 
  isOpen={loading && loadingType !== null} 
  type={loadingType || 'topic-recommendation'}
/>
```

### Student Session
```tsx
// For evidence search or other AI processes
<LoadingOverlay
  isVisible={searchingEvidence}
  message="근거자료를 검색하고 있습니다"
  submessage="네이버 뉴스와 YouTube에서 자료를 찾고 있어요..."
  type="spinner"
/>
```

## Best Practices

### 1. Choose the Right Component
- **LoadingModal**: Long AI processes (>5 seconds)
- **LoadingOverlay**: Medium tasks (1-5 seconds)
- **InlineLoading**: Quick actions (<1 second)
- **LoadingSkeleton**: Content placeholders

### 2. Provide Context
- Use specific loading messages
- Show estimated time when possible
- Explain what's happening

### 3. Handle Errors Gracefully
- Dismiss loading states on errors
- Provide clear error messages
- Allow users to retry

### 4. Performance Considerations
- Clean up intervals and timeouts
- Use React.memo for static components
- Avoid nested loading states

## Future Enhancements

### Planned Features
1. **Progress Persistence**: Save progress across page refreshes
2. **Queue Management**: Handle multiple concurrent operations
3. **Customizable Stages**: Allow custom loading steps
4. **Analytics**: Track loading times and user behavior
5. **Themes**: Multiple visual themes for different contexts

### Accessibility Improvements
1. **Voice Announcements**: Screen reader progress updates
2. **Reduced Motion**: Honor prefers-reduced-motion
3. **Focus Management**: Better keyboard navigation
4. **High Contrast**: Improved visibility options

This documentation provides a comprehensive guide for implementing and using the loading components throughout the Question Talk application.