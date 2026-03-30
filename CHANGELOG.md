# Changelog

## [US-6: 파일 저장 및 불러오기] - 2026-03-30

### Added
- **Types** (`src/types/`)
  - `DocumentTypes.js` — DocumentMeta 모델, createDocumentMeta, updateDocumentMeta, validateDocumentMeta, EXPORT_VERSION

- **Utils** (`src/utils/`)
  - `StorageManager.js` — 다중 문서 localStorage 관리 (mindmap-docs/index, mindmap-docs/{docId})
  - `FileExporter.js` — JSON 내보내기 (export envelope, Blob 다운로드)
  - `FileImporter.js` — JSON 가져오기 (FileReader, NodeValidator 검증, 파일 피커)

- **Store** (`src/store/`)
  - `FileManagerStore.js` — Zustand 스토어 (문서 CRUD, 활성 문서 관리, 레거시 마이그레이션)

### Changed
- `src/store/MindMapStore.js` — 인라인 storage 객체 제거 → FileManagerStore 연동, activeDocumentId 상태 추가, 12곳 storage.save → _saveToStorage 치환
- `src/components/MindMap/Toolbar.jsx` — 저장/내보내기/가져오기 버튼 추가 (saveFeedback 포함)
- `src/components/MindMap/MindMap.jsx` — FileManagerStore.initialize() 호출 추가

### Tests
- `src/types/DocumentTypes.test.js` — 15 tests (createDocumentMeta, updateDocumentMeta, validateDocumentMeta)
- `src/utils/StorageManager.test.js` — 16 tests (loadIndex, saveDocument, 레거시 관리)
- `src/store/FileManagerStore.test.js` — 17 tests (initialize, CRUD, 마이그레이션)
- `src/utils/FileExporter.test.js` — 7 tests (generateExportFilename, createExportEnvelope, exportToJSON)
- `src/utils/FileImporter.test.js` — 7 tests (importFromJSON, openFilePicker)
- Total: 192 tests passing / 14 test suites

### Technical Notes
- 스토리지 구조: 단일 키(mindmap-app-data) → 다중 키(mindmap-docs/index + mindmap-docs/{docId})
- MindMapStore ↔ FileManagerStore 단방향 의존 (FileManagerStore는 MindMapStore를 모름)
- 레거시 자동 마이그레이션: 앱 시작 시 mindmap-app-data → mindmap-docs/* 일회성 이관
- Export envelope: { version: 1, exportedAt, meta: {title, nodeCount}, data }
- Import 검증: JSON 파싱 → 버전 확인 → validateMindMap (기존 NodeValidator 재사용)
- Total: 11 files changed (5 new, 3 modified, 3 test updates)

---

## [US-5 버그 수정: 노드 드래그 Y축 에러 + 연결선 끊김 + 성능] - 2026-03-30

### Problem
1. 노드를 위쪽으로 드래그하면 모든 노드가 화면에서 사라짐
2. 에러 발생 시 복구 불가 (전체 화면이 에러 메시지로 대체)
3. 노드를 위/아래로 많이 드래그하면 연결선이 끊겨 보임
4. 드래그 중 끊기는 현상 (매 mousemove마다 무거운 연산)

### Root Cause
1. `NodeValidator.js`에서 `position.y < 0` 거부 → store error 상태 → MindMap 에러 화면 전환 → 전체 노드 사라짐
2. 에러 시 MindMap 전체를 에러 화면으로 교체하여 복구 불가
3. SVG 기본 `overflow: hidden`으로 음수 좌표의 연결선이 잘림
4. 매 mousemove마다 전체 트리 validation + localStorage 직렬화 수행

### Solution
1. Validator position 제한 `-4096~4096` 확장, 드래그 중 validation/localStorage 생략
2. 에러 발생 시 에러 배너로 표시 (MindMap 컨테이너 유지)
3. SVG에 `overflow: visible` 추가
4. `updateNodePosition` 경량화 + `saveNodePositions` 액션 분리 (drag end 시만 저장)

### Changed
- `src/utils/NodeValidator.js` — position 범위 `min: 0` → `min: -4096`
- `src/components/MindMap/MindMap.jsx` — 에러 배너 UI로 교체 (MindMap 유지)
- `src/components/MindMap/MindMapContainer.jsx` — SVG `overflow: visible` 추가
- `src/store/MindMapStore.js` — `updateNodePosition` 경량화, `saveNodePositions` 추가
- `src/components/MindMap/Node.jsx` — drag end 시 `saveNodePositions()` 호출
- `src/components/MindMap/Node.test.jsx` — `saveNodePositions` mock 추가
- `tests/Node.test.jsx` — `saveNodePositions` mock 추가
- `tests/__mocks__/MindMapStore.js` — `saveNodePositions` mock 추가
- `jest.config.js` — `/e2e/` 테스트 경로 제외

### Added
- `playwright.config.js` — Playwright 설정 (Vite dev server 연동)
- `e2e/node-drag.spec.js` — E2E 테스트 7개 (드래그, 패닝+드래그, 연결선 추적)

### Tests
- 단위 테스트: 130/130 통과 / 9 스위트
- E2E 테스트: 7/7 통과 (Playwright + Chromium)

### Technical Notes
- Total: 12 files changed, ~280 insertions(+), ~25 deletions(-)

---

## [US-5: 캔버스 패닝 (Canvas Panning)] - 2026-03-30

### Added
- **Store** (`src/store/`)
  - `MindMapStore.js` — viewport 상태 및 panViewport, setViewport, resetViewport 액션 추가

### Changed
- `src/components/MindMap/MindMapContainer.jsx` — transform 래퍼 div 추가, 배경 드래그 패닝 이벤트 핸들러 구현, viewportOffset prop 전달
- `src/components/MindMap/Node.jsx` — viewportOffset prop 추가, 드래그 좌표 변환 (화면→월드)
- `src/components/MindMap/Toolbar.jsx` — "중앙 이동" resetViewport 버튼 추가
- `SPRINT-2.md` — 기존 US-5~US-8을 US-6~US-9로 시프트, 새 US-5 캔버스 패닝 삽입
- `tests/__mocks__/MindMapStore.js` — viewport 관련 mock 추가

### Tests
- `src/store/MindMapStore.test.js` — viewport 액션 테스트 6개 추가 (초기값, panViewport, setViewport, resetViewport, 누적, reset 포함)
- Total: 130 tests passing / 9 test suites

### Technical Notes
- 패닝 트리거: 배경(빈 공간) mousedown, 노드는 stopPropagation으로 충돌 없음
- Transform 방식: `transform: translate(viewport.x, viewport.y)` 래퍼 div
- 노드 드래그: `worldX = screenX - viewportOffset.x` 좌표 변환
- Total: 8 files changed, ~120 insertions(+), ~20 deletions(-)

---

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
