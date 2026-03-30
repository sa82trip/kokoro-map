# Changelog

## [US-9: 폴더 구조 관리] - 2026-03-30

**Branch**: `main`

### Added
- **Types** (`src/types/`)
  - `FolderTypes.js` — Folder 모델, createFolder, updateFolder, validateFolder, getFolderDepth, MAX_FOLDER_DEPTH(3)

- **Utils** (`src/utils/`)
  - `StorageManager.js` — loadFolders, saveFolders, hasFolders 메서드 추가 (mindmap-docs/folders 키)

- **Store** (`src/store/`)
  - `FileManagerStore.js` — folders, activeFolderId 상태 추가. createFolder, renameFolder, deleteFolder, moveDocumentToFolder, setActiveFolderId 액션 추가. getDescendantFolderIds 헬퍼. initialize에서 폴더 로드. getFilteredDocuments에 폴더 필터 추가

- **Components** (`src/components/Home/`)
  - `FolderTree.jsx` + `FolderTree.css` — 사이드바 폴더 트리 (전체 문서, 확장/접힘, 활성 표시, 우클릭 컨텍스트 메뉴, 생성/이름변경 다이얼로그)
  - `FolderCreateDialog.jsx` + `FolderCreateDialog.css` — 폴더 생성/이름변경 모달 (create/rename 모드, ESC/오버레이 닫기, 빈 이름 비활성화)
  - `FolderContextMenu.jsx` + `FolderContextMenu.css` — 우클릭 컨텍스트 메뉴 (이름 변경, 삭제)
  - `FolderPickerDialog.jsx` + `FolderPickerDialog.css` — 문서 이동 다이얼로그 (루트 + 폴더 목록, 현재 위치 표시)

### Changed
- `src/components/Home/HomeScreen.jsx` — FolderTree import, .home-body flex 래퍼 추가
- `src/components/Home/HomeScreen.css` — .home-body flex 레이아웃, .home-content overflow-y 추가
- `src/components/Home/RecentDocumentList.jsx` — activeFolderId 구독, 폴더 빈 상태 "이 폴더에 문서가 없습니다" 추가
- `src/components/Home/DocumentCard.jsx` — 폴더 태그(folderName), 이동 버튼, FolderPickerDialog 연동
- `src/components/Home/DocumentCard.css` — .document-card-actions (이동+삭제 버튼 그룹), .document-card-folder-tag 스타일

### Tests
- `FolderTypes.test.js` — 19 tests (createFolder, updateFolder, validateFolder, getFolderDepth)
- `StorageManager.test.js` — 5 tests 추가 (loadFolders, saveFolders, hasFolders, 키 검증)
- `FileManagerStore.test.js` — 16 tests 추가 (createFolder, renameFolder, deleteFolder, moveDocumentToFolder, setActiveFolderId, 폴더 필터링)
- `FolderCreateDialog.test.jsx` — 9 tests (create/rename 모드, 확인/취소, ESC, Enter, 빈 이름)
- `FolderContextMenu.test.jsx` — 4 tests (렌더링, 이름 변경, 삭제, 위치)
- `FolderTree.test.jsx` — 13 tests (전체 문서, 폴더 렌더링, 클릭, 확장, 우클릭, 다이얼로그)
- `FolderPickerDialog.test.jsx` — 6 tests (렌더링, 폴더 목록, 현재 위치, 선택, 취소)
- `DocumentCard.test.jsx` — 3 tests 추가 (폴더 태그, 이동 버튼)
- `RecentDocumentList.test.jsx` — 2 tests 추가 (폴더 필터링, 빈 폴더 상태)
- `HomeScreen.test.jsx` — 1 test 추가 (FolderTree 렌더링)
- Total: 340 tests passing / 24 test suites

### 버그 수정 (동일 커밋)
- FolderTree: createFolder(name) → createFolder(name, parentFolderId) 전달 수정, 컨텍스트 메뉴 "하위 폴더 만들기" 추가
- FolderPickerDialog: createPortal(dialog, document.body) 적용하여 DocumentCard overflow:hidden 문제 해결
- Total: 343 tests passing / 24 test suites

### Known Issues
- FolderPickerDialog에서 폴더 계층 구분 없음 — flat 리스트로 표시되어 루트/하위 폴더 구분 불가

### Technical Notes
- 폴더 최대 깊이 3단계 제한 (getFolderDepth로 부모 체인 계산)
- 폴더 삭제 시 자손 폴더도 재귀 삭제 + 고아 문서는 루트(folderId=null)로 이동
- StorageManager.includes() 대신 indexOf() 사용 (core-js 호환성)
- FolderTree 내부 상태: expandedFolders(Set), contextMenu, dialogState
- HomeScreen 레이아웃: header → .home-body(FolderTree | .home-content)
- Total: 14 files changed (8 new, 6 modified), ~780 insertions(+)

---

## [US-8: 검색 및 필터링] - 2026-03-30

**Branch**: `main`

### Added
- **Store** (`src/store/`)
  - `FileManagerStore.js` — searchQuery, dateFilter, sortBy, searchInContent 상태 및 setSearchQuery, setDateFilter, setSortBy, setSearchInContent, clearSearch, getFilteredDocuments 액션 추가. searchInNodeTree 헬퍼 함수 추가

- **Components** (`src/components/Home/`)
  - `SearchBar.jsx` + `SearchBar.css` — 검색 입력창, 지우기 버튼, 노드 내용 검색 토글
  - `FilterDropdown.jsx` + `FilterDropdown.css` — 기간 필터(전체/오늘/이번주/이번달) + 정렬(최근순/이름순/생성순) select 드롭다운

### Changed
- `src/components/Home/DocumentCard.jsx` — highlight prop 추가, highlightText 함수로 검색어 하이라이트(mark 태그)
- `src/components/Home/RecentDocumentList.jsx` — store의 getFilteredDocuments 사용하도록 변경, 검색 결과 없음 UI 추가
- `src/components/Home/HomeScreen.jsx` — SearchBar + FilterDropdown 통합 (search-filter-bar)
- `src/components/Home/HomeScreen.css` — search-filter-bar 스타일 추가
- `src/types/DocumentTypes.js` — updateDocumentMeta에서 data.text(루트 노드)를 title로 자동 갱신

### Tests
- `FileManagerStore.test.js` — 19 tests 추가 (검색어 설정, 날짜 필터, 정렬, getFilteredDocuments, 노드 내용 검색, clearSearch)
- `SearchBar.test.jsx` — 9 tests (렌더링, 입력, 지우기, 내용 검색 토글)
- `FilterDropdown.test.jsx` — 7 tests (렌더링, 옵션, 변경, 상태 반영)
- `DocumentCard.test.jsx` — 5 tests 추가 (하이라이트 렌더링, 매칭, 대소문자, 다중 매칭)
- `RecentDocumentList.test.jsx` — 3 tests 추가 (검색 필터링, 빈 결과, highlight 전달)
- `HomeScreen.test.jsx` — 2 tests 추가 (SearchBar, FilterDropdown 렌더링)
- `DocumentTypes.test.js` — 3 tests 추가 (루트 노드 텍스트로 title 갱신, null 시 유지, 빈 문자열 시 유지)
- Total: 262 tests passing / 19 test suites

### Technical Notes
- 검색 로직: FileManagerStore.getFilteredDocuments()에서 검색→날짜필터→정렬 순으로 처리
- 노드 내용 검색: searchInContent 토글 시 StorageManager.loadDocument로 문서 데이터 로드 후 트리 순회
- 하이라이트: DocumentCard의 highlightText가 대소문자 무관 매칭, 다중 매칭 지원
- 기존 MAX_RECENT_DOCS 제한 제거 → store 기반 필터링으로 통합
- updateDocumentMeta가 루트 노드 텍스트를 title에 반영하여 카드 제목이 항상 최신 루트 노드명을 표시
- Total: 9 files changed (2 new, 7 modified)

---

## [US-7: 최근 문서 관리] - 2026-03-30

**Branch**: `main`

### Added
- **Dependencies** (`package.json`)
  - `react-router-dom` — React Router v6

- **Components** (`src/components/Home/`)
  - `HomeScreen.jsx` — 홈 화면 (헤더, 새 마인드맵 버튼, RecentDocumentList)
  - `HomeScreen.css` — 헤더 sticky, 버튼 스타일, 반응형
  - `DocumentCard.jsx` — 문서 카드 (썸네일, 상대시간 포맷, 삭제 확인 오버레이)
  - `DocumentCard.css` — 카드 호버 애니메이션, 삭제 버튼 페이드인
  - `RecentDocumentList.jsx` — 최근 문서 목록 (updatedAt 정렬, 최대 20개, 빈 상태)
  - `RecentDocumentList.css` — 그리드 레이아웃, 반응형 768px/480px

- **Components** (`src/components/MindMap/`)
  - `MindMapEditor.jsx` — URL docId 기반 문서 로드/생성 에디터 래퍼

### Changed
- `src/main.jsx` — BrowserRouter로 App 감싸기
- `src/App.jsx` — Routes 설정 (`/` HomeScreen, `/editor/:docId` MindMapEditor, `*` → `/`)
- `jest.setup.js` — TextEncoder/TextDecoder polyfill 추가 (react-router-dom 호환)

### Tests
- `DocumentCard.test.jsx` — 9 tests (렌더링, 클릭, 삭제 확인/취소, 썸네일, 시간 포맷)
- `RecentDocumentList.test.jsx` — 7 tests (렌더링, 정렬, 빈 상태, 클릭, 삭제, 20개 제한)
- `HomeScreen.test.jsx` — 6 tests (헤더, 버튼, 라우팅, 초기화)
- Total: 214 tests passing / 17 test suites

### Technical Notes
- 라우팅: `/` (홈), `/editor/new` (새 문서 → 실제 docId로 URL 교체), `/editor/:docId` (기존 문서)
- 삭제: DocumentCard 오버레이 → RecentDocumentList → FileManagerStore.deleteDocument
- MindMap.jsx는 수정하지 않음 (MindMapEditor가 래핑)
- Vite build 성공 (78 modules, 220KB gzipped 72KB)

---

## [US-7 Task 7-3 + 7-4: RecentDocumentList 컴포넌트 + 삭제 기능 통합] - 2026-03-30

### Added
- **Components** (`src/components/Home/`)
  - `RecentDocumentList.jsx` — 최근 문서 목록 (updatedAt 내림차순 정렬, 최대 20개, 빈 상태 SVG+안내 메시지)
  - `RecentDocumentList.css` — 그리드 레이아웃 (auto-fill, minmax 220px), 반응형 768px/480px 브레이크포인트

### Tests
- `src/components/Home/RecentDocumentList.test.jsx` — 7 tests (렌더링, 정렬, 빈 상태, 클릭, 삭제, 콜백, 최대 20개)
- Total: 208 tests passing / 16 test suites

### Technical Notes
- DocumentCard 모킹하여 독립적으로 RecentDocumentList 로직만 테스트
- FileManagerStore.deleteDocument 직접 호출 → 스토어 상태에서 문서 제거 + onDeleteDocument 콜백
- useMemo로 documents 변경 시에만 정렬/슬라이스 재계산
- Total: 3 files added

---

## [US-7 Task 7-5: react-router-dom 설치 및 라우팅 설정] - 2026-03-30

### Added
- **Dependencies** (`package.json`)
  - `react-router-dom` — React Router v6 추가

- **Components** (`src/components/MindMap/`)
  - `MindMapEditor.jsx` — URL 파라미터(docId) 기반 문서 로드/생성 에디터 래퍼

- **Components** (`src/components/Home/`)
  - `HomeScreen.jsx` — 홈 화면 임시 placeholder (다른 Agent가 본격 구현 예정)
  - `HomeScreen.css` — 홈 화면 기본 스타일

### Changed
- `src/main.jsx` — BrowserRouter로 App 감싸기 추가
- `src/App.jsx` — 정적 MindMap 렌더링 → React Router Routes 기반으로 전체 교체
  - `/` → HomeScreen
  - `/editor/:docId` → MindMapEditor
  - `*` → `/` 리다이렉트

### Technical Notes
- MindMap.jsx는 수정하지 않음 (기존 코드 그대로 유지)
- MindMapEditor는 docId가 'new'면 새 문서 생성 후 실제 docId로 URL 교체
- 기존 문서 ID가 존재하지 않으면 홈으로 리다이렉트
- Vite build 성공 (73 modules, 215KB gzipped 70KB)

---

## [US-7 Task 7-2: DocumentCard 컴포넌트] - 2026-03-30

### Added
- **Components** (`src/components/Home/`)
  - `DocumentCard.jsx` — 문서 카드 컴포넌트 (썸네일/플레이스홀더, 상대시간 포맷, 삭제 확인 오버레이)
  - `DocumentCard.css` — 카드 스타일 (호버 애니메이션, 삭제 버튼 페이드인, 반응형)

### Tests
- `src/components/Home/DocumentCard.test.jsx` — 9 tests (렌더링, 클릭, 삭제 확인/취소, 썸네일, 시간 포맷)
- Total: 201 tests passing / 15 test suites

### Technical Notes
- 썸네일 없으면 마인드맵 아이콘 SVG 플레이스홀더 표시
- formatDate: 방금 전 / N분 전 / N시간 전 / N일 전 / 날짜 포맷 자동 변환
- 삭제 버튼은 hover 시에만 표시 (opacity 트랜지션)
- 삭제 확인은 전체 카드 오버레이 (stopPropagation으로 카드 클릭 전파 차단)
- Total: 3 files added

---

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
