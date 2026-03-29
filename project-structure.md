# 프로젝트 구조

```
mindmap-app/
├── src/
│   ├── components/
│   │   └── MindMap/
│   │       ├── MindMap.jsx      # 메인 마인드맵 컴포넌트
│   │       ├── MindMapContainer.jsx  # 컨테이너 컴포넌트
│   │       └── Node.jsx         # 노드 컴포넌트
│   ├── store/
│   │   └── MindMapStore.js      # Zustand 상태 관리 스토어
│   ├── styles/
│   │   └── MindMap.css         # 스타일시트
│   └── App.jsx                 # 메인 애플리케이션
├── sprints/
│   └── sprint-1/
│       └── user-story-1/
│           ├── README.md       # 사용자 스토리 개요
│           └── tasks/          # 상세 태스크
│               ├── 1-1.md      # 컴포넌트 설계
│               ├── 1-2.md      # 데이터 구조 정의
│               ├── 1-3.md      # 루트 노드 구현
│               └── 1-4.md      # 기본 레이아웃 CSS
├── handoff/
│   └── current-status.md      # 현재 진행 상태
├── dashboard.md                # 전체 대시보드
├── SPRINT-1.md                # Sprint 1 계획서
├── package.json               # 의존성 관리
└── project-structure.md       # 이 문서
```

## 컴포넌트 설계 설명

### 1. MindMap 컴포넌트
- **역할**: 메인 컴포넌트로 상태 관리 스토어와 연결
- **Props**: `initialData` (초기 데이터)
- **기능**:
  - 데이터 로딩 상태 관리
  - 에러 처리
  - 자식 컴포넌트 렌더링

### 2. MindMapContainer 컴포넌트
- **역할**: 노드를 표시할 컨테이너 생성
- **Props**: `data` (마인드맵 데이터)
- **기능**:
  - 배경 그라데이션 적용
  - 노드 위치 계산
  - 절대적 배치 관리

### 3. Node 컴포넌트
- **역할**: 개별 노드 표시 및 상호작용
- **Props**: `node`, `position`
- **기능**:
  - 드래그 이동
  - 텍스트 편집
  - 시각적 피드백 (hover, drag)

### 4. MindMapStore (Zustand)
- **역할**: 상태 중앙 관리
- **상태**: `mindMapData`, `loading`, `error`
- **액션**: 데이터 업데이트, 에러 처리, 초기화
- **특징**: 불변성 유지, 간결한 API

## 주요 특징
1. **단일 책임 원칙**: 각 컴포넌트는 특정 기능만 담당
2. **상태 관리**: Zustand를 사용한 간결한 상태 관리
3. **반응형 디자인**: 모바일 대응을 위한 CSS
4. **접근성**: 키보드 네비게이션 지원
5. **애니메이션**: 입/출력 애니메이션 지원

---

**생성일**: 2026-03-29