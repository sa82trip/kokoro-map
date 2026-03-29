# Changelog

마인드맵 프로젝트의 주요 변경 사항을 기록합니다.

---

## [US-4: 시각적 기본 기능] - 2026-03-30

**Branch**: `main`

### Added
- **NodeTypes** (`src/types/`)
  - `COLOR_PALETTE` — 50색 배열 (기존 8 + 파스텔 12 + 비비드 12 + 다크 10 + 뉴트럴 8)
- **LayoutEngine** (`src/utils/`)
  - `DEFAULT_OPTIONS` — 동적 gap 설정 (horizontalGap, verticalGap)
  - 모든 함수에 `options` 파라미터 추가 (하위 호환)
- **MindMapStore** (`src/store/`)
  - `layoutConfig` 상태 — { horizontalGap: 100, verticalGap: 30 }
  - `connectionStyle` 상태 — 'bezier' | 'straight'
  - `connectionColor` 상태 — 연결선 색상
  - `setLayoutConfig(config)` — gap 값 변경 (범위 20~500)
  - `setConnectionStyle(style)` — 연결선 스타일 토글
  - `setConnectionColor(color)` — 연결선 색상 변경
  - `resetLayout()` — 전체 레이아웃 재조정
  - `updateNodeStyle()`에 `backgroundColor` 검증 추가
- **Toolbar** (`src/components/MindMap/`)
  - 설정 패널 (연결선 스타일/색상, 수평/수직 간격 슬라이더)
  - 레이아웃 재조정 버튼
- **NodeEditorToolbar** (`src/components/MindMap/`)
  - 배경색 선택 (16색)
- **MindMapContainer** (`src/components/MindMap/`)
  - 동적 연결선 스타일 (곡선/직선)
  - 동적 연결선 색상

### Changed
- `NodeEditorToolbar.jsx` — TEXT_COLORS를 명시적 12색으로 정의, BG_COLORS(16색) 추가
- `MindMapContainer.jsx` — `renderConnections`에 connectionStyle, connectionColor 파라미터 추가
- `Toolbar.jsx` — store에서 설정 관련 상태/액션 import, 설정 패널 UI 추가

### Tests
- `NodeTypes.test.js` — 11 tests (COLOR_PALETTE 4개 추가)
- `LayoutEngine.test.js` — 7 tests (신규)
- `MindMapStore.test.js` — 26 tests (connectionStyle 4, layoutConfig 5, backgroundColor 2, connectionColor 3, resetLayout 1 추가)
- Total: 124 tests passing (9 suites)

### Technical Notes
- TDD 방식으로 모든 태스크 구현 (Red → Green)
- 하위 호환 유지: LayoutEngine options 기본값 = {}
- Task 4-1, 4-3, 4-5 병렬 구현 후 4-2, 4-4, 4-6 순차 구현

---

## [Task 4-5: 노드 간 거리 조절 기능] - 2026-03-30

**Branch**: `main`

### Added
- **LayoutEngine** (`src/utils/`)
  - `DEFAULT_OPTIONS` — 기본 gap 설정 객체 (horizontalGap: 100, verticalGap: 30)
  - `calculateAutoLayout(rootNode, options)` — options 파라미터로 사용자 정의 gap 지원
  - `calculateNewChildPosition(parentPosition, existingChildrenCount, options)` — options 파라미터로 사용자 정의 gap 지원
- **MindMapStore** (`src/store/`)
  - `layoutConfig` 상태 — { horizontalGap: 100, verticalGap: 30 }
  - `setLayoutConfig(config)` — gap 값 변경 액션 (범위 제한 20~500, 부분 업데이트 지원)
- **Tests** (`src/utils/`)
  - `LayoutEngine.test.js` — 7개 신규 테스트 (위치 할당, 자식 배치, null 처리, 사용자 정의 gap)
- **Tests** (`src/store/`)
  - `MindMapStore.test.js` — layoutConfig 5개 신규 테스트 (기본값, 변경, 최소/최대, 부분 업데이트)

### Changed
- `LayoutEngine.js` — `getSubtreeHeight`, `layoutNode` 내부 함수에 options 파라미터 전달
- `MindMapStore.js` — `applyAutoLayout`가 `layoutConfig`를 `calculateAutoLayout`에 전달
- `MindMapStore.js` — `reset`에 `layoutConfig` 초기화 추가

### Technical Notes
- TDD 방식: Red(12개 테스트 실패) → Green(구현) → 모든 테스트 통과
- 하위 호환 유지: options 기본값 = {}로 기존 호출 방식 그대로 동작
- gap 값 범위: 20~500 (Math.min/Math.max로 제한)
- 총 12개 신규 테스트, 전체 416 tests (3개 connectionStyle 실패는 별도 Task 범위)

---

## [Task 4-1: 색상 팔레트 50가지] - 2026-03-30

**Branch**: `main`

### Added
- **NodeTypes** (`src/types/`)
  - `COLOR_PALETTE` — 50색 배열 named export (기존 8색 + 파스텔 12 + 비비드 12 + 다크 10 + 뉴트럴 8)
- **Tests** (`src/types/`)
  - `NodeTypes.test.js` — COLOR_PALETTE 테스트 4개 추가 (길이, 형식, 중복, 기존 색상 포함)

### Changed
- `NodeTypes.js` — `CHILD_COLORS`를 `COLOR_PALETTE.slice(0, 8)`로 변경 (하위 호환 유지)
- `NodeTypes.test.js` — `COLOR_PALETTE` import 추가

### Tests
- `NodeTypes.test.js` — 11 tests (기존 7 + 신규 4)
- Total: 11/11 passing

### Technical Notes
- TDD 방식: Red(테스트 4개 실패) → Green(COLOR_PALETTE 구현) → 모든 테스트 통과
- 기존 `getChildNodeColor`, `createChildNode` 동작은 변경 없음 (하위 호환)

---

## [0.3.0] - 2026-03-29

**Branch**: `main`

### Added
- **NodeEditorToolbar** (`src/components/MindMap/`)
  - `NodeEditorToolbar.jsx` — 폰트 크기 슬라이더, Bold/Italic 토글, 텍스트 색상 피커 (12색)
- **TextMeasurer** (`src/utils/`)
  - `TextMeasurer.js` — Canvas 기반 텍스트 크기 측정 (캐시 500개, named + default export)
- **NodeTypes** (`src/types/`)
  - `DEFAULT_NODE_STYLE` — fontSize(16), textColor(#FFFFFF), fontWeight(500), fontStyle(normal) 기본값
  - ITreeNode, NodeSchema에 style 속성 추가
- **MindMapStore** (`src/store/`)
  - `updateNodeStyle(nodeId, styleProps)` — 노드 스타일 업데이트 (유효성 검증 포함)
  - `loadFromStorage` — 기존 데이터 style 필드 마이그레이션
- **Node** (`src/components/MindMap/`)
  - 더블클릭 편집 모드 진입
  - `isSelected` prop 기반 툴바 표시/숨김
  - Canvas 텍스트 측정 → 노드 박스 자동 크기 조절
  - 디바운스 자동 저장 (300ms)
  - 스타일 적용: fontSize, textColor, fontWeight, fontStyle

### Changed
- `MindMapContainer.jsx` — `useEffect` hooks 순서 수정 (early return 전 호출), `node.position` 기반 연결선 계산, `TextMeasurer`로 동적 노드 크기 반영, 외부 클릭 감지로 툴바 자동 닫힘
- `createRootNode/createChildNode` — style 기본값 포함
- `Node.test.jsx` — `isSelected={true}` prop 기반 테스트, `TextMeasurer` mock 추가
- `MindMapCSS.test.js` — `deleteNode`, `TextMeasurer` mock 추가

### Fixed
- React Hooks 순서 위반 — `useEffect`가 `if (!data) return null` 뒤에 있던 문제
- 연결선 위치 오류 — `node.position` 미사용으로 부모 노드에서 떨어져 보이던 문제
- `TextMeasurer` named export 미지원 → `export {}` + `export default` 병행
- `localStorage` 기존 데이터 마이그레이션 — style 필드 자동 추가
- `.includes()` → `indexOf` 변경 (core-js 미설치 환경 호환)

### Tests
- Total: 98 tests passing (8 suites)
- NodeEditorToolbar: 툴바 표시/숨김, Bold, Italic, 폰트 크기, 색상 변경
- 노드 스타일: 커스텀 스타일, 기본값, 자동 크기 조절

---

## [0.2.0] - 2026-03-29

### Added
- Toolbar 컴포넌트 — 새 마인드맵 생성 버튼, 제목 편집, 자동 정렬 버튼
- 방사형 자동 레이아웃 엔진 (`LayoutEngine.js`) — 트리 형태 자동 배치
- localStorage 상태 저장/로드 — 데이터 변경 시 자동 저장, 시작 시 복원
- `createNewMindMap` 스토어 액션 — 새 마인드맵 생성 (기존 데이터 확인 다이얼로그)
- `applyAutoLayout` 스토어 액션 — 전체 노드 자동 정렬
- `updateMindMapTitle` 스토어 액션 — 루트 노드 제목 변경
- `loadFromStorage` 스토어 액션 — localStorage에서 데이터 로드
- 자식 노드 추가 시 레이아웃 엔진 기반 위치 자동 계산

### Changed
- `MindMap.jsx` — localStorage 우선 로드, 툴바 통합
- `MindMapContainer.jsx` — 툴바 공간 확보 (paddingTop: 52px)
- `MindMapStore.js` — 모든 데이터 변경 시 localStorage 자동 저장

---

## [0.1.1] - 2026-03-29

### Fixed
- `createChildNode` ID 중복 버그 수정 — counter 추가
- `DeleteConfirmDialog` mousedown 이벤트 버블링으로 인한 삭제 미동작 버그 수정
- `MindMapStore` 중첩 set() 호출로 에러가 덮어씌워지는 버그 수정

### Added
- `DeleteConfirmDialog` 컴포넌트 — 삭제 확인/취소, Escape 지원, 하위 노드 수 안내
- Node 삭제 버튼(×) — 루트 노드에는 숨김 처리
- MindMapContainer에 deleteNode 연결
- 테스트 80/80 통과 (Store 5, Dialog 6, Node 6 신규)

---

## [0.1.0] - 2026-03-29

### Added
- 프로젝트 초기 구조 (Vite + React + Zustand)
- `Node` 컴포넌트 — 렌더링, 텍스트 편집, 드래그 앤 드롭
- `MindMapContainer` 컴포넌트 — SVG 연결선, 노드 렌더링
- `MindMapStore` (Zustand) — CRUD 액션, 유효성 검증
- `NodeTypes` — 데이터 구조, 8색 팔레트, createRootNode/createChildNode
- `NodeValidator` — 노드/마인드맵 유효성 검증
- SVG 베지어 곡선 부모-자식 연결선
- document 레벨 마우스 이벤트로 드래그 개선
- 반응형 CSS, 애니메이션, 접근성 스타일
- 테스트 63/63 통과 (Store, Node, CSS)

### Infrastructure
- Agile 프로젝트 관리 문서 (대시보드, Sprint 계획서, Handoff)
