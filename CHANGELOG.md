# Changelog

## [버그 수정: 자동정렬/재조정 노드-간선 분리 + 기능 분리] - 2026-03-30

### Problem
자동정렬/재조정 버튼 클릭 시 연결선은 새 위치로 이동하지만 노드는 제자리에 남아 분리되는 현상. 새로고침해야 복구됨. 또한 자동정렬과 재조정 버튼이 완전히 동일한 동작을 수행함.

### Root Cause
1. Node 컴포넌트가 `useState(initialPosition)`으로 position을 초기화하나, `useState`는 첫 렌더링에만 초기값을 사용하여 store의 position 변경이 반영되지 않음
2. `applyAutoLayout`과 `resetLayout`이 동일한 `calculateAutoLayout` 호출로 기능 중복

### Solution
1. Node에 `useEffect` 추가 — 외부에서 position 변경 시 local state 동기화 (드래그 중에는 제외)
2. `resetLayout`을 간격 설정 기본값 초기화 + 재배치로 변경하여 자동정렬과 차별화

### Changed
- `src/components/MindMap/Node.jsx` — 외부 position 변경 동기화 useEffect 추가
- `src/store/MindMapStore.js` — `resetLayout`이 간격 설정도 기본값으로 초기화하도록 변경

### Added
- `SPRINT-2.md` — Sprint 2 계획서 (파일 관리 및 저장 시스템)

### Tests
- 기존 124개 테스트 모두 통과

### Technical Notes
- 자동정렬: 사용자 간격 설정 유지 + 전체 재배치
- 재조정: 간격 기본값(수평 100px, 수직 30px) 초기화 + 전체 재배치
- Total: 3 files changed, 20 insertions(+), 6 deletions(-)

---

## [Sprint 1 완료: 마인드맵 기본 생성/편집] - 2026-03-30

### Added
- **Components** (`src/components/MindMap/`)
  - `MindMap.jsx` - 메인 마인드맵 컴포넌트
  - `MindMapContainer.jsx` - 노드/연결선 렌더링 컨테이너
  - `Node.jsx` - 개별 노드 컴포넌트 (드래그, 인라인 편집)
  - `Toolbar.jsx` - 상단 툴바 (제목, 설정, 레이아웃)
  - `NodeEditorToolbar.jsx` - 노드 스타일 편집 툴바
  - `DeleteConfirmDialog.jsx` - 삭제 확인 다이얼로그

- **Store** (`src/store/`)
  - `MindMapStore.js` - Zustand 상태 관리 (노드 CRUD, 레이아웃, 저장)

- **Utils** (`src/utils/`)
  - `LayoutEngine.js` - 트리 자동 레이아웃 계산
  - `TextMeasurer.js` - 텍스트 크기 측정
  - `NodeValidator.js` - 노드 데이터 검증

- **Types** (`src/types/`)
  - `NodeTypes.js` - 노드 데이터 구조, 색상 팔레트

### Tests
- Total: 124 tests passing / 9 test suites
