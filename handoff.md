# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11, US-13, US-14, US-15, Split Layout 완료
**다음 작업**: US-12 테마 시스템 (다크 모드)

## 최근 작업

### 2026-03-31: US-14 PNG 내보내기 + 다이얼로그 버그 수정
- **브랜치**: `main`

**Data Layer:**
- `FileExporter.js` — PNG 내보내기 함수 추가 (exportToPNG, calculateCaptureArea, generatePNGFilename)
- `StringUtils.js` — 공통 파일명 유틸리티 (sanitizeFilename, generateExportFilename)
- `FileHelper.js` — 공통 파일 다운로드 유틸리티 (downloadFile, downloadJSON)

**UI:**
- `ExportDialog.jsx` — PNG/JSON 탭 내보내기 다이얼로그 (배경색, 여백, 해상도 설정)
- `Toolbar.jsx` — 내보내기 버튼, createPortal로 다이얼로그 렌더링, 알림 시스템

**Bug Fix:**
- 다이얼로그가 Toolbar 내부에 렌더링되어 상단이 잘리는 문제 → `createPortal(document.body)`로 해결
- 내보내기/새 마인드맵 다이얼로그 모두 `paddingTop: 80` + `alignItems: 'flex-start'` 적용

### 2026-03-31: 화면 확대/축소 기능
- **브랜치**: `main` (US-15 완료)

### 2026-03-30: Split Layout (좌/우 분할 배치)
- **브랜치**: `main`

**Data Layer:**
- `NodeTypes.js` — `direction` 필드 추가 (ITreeNode, NodeSchema, createChildNode)
- `LayoutEngine.js` — `assignDirections` 교대 분배, `layoutNode` direction 파라미터, `calculateAutoLayout` 좌/우 독립 배치, `calculateNewChildPosition` direction 지원

**UI:**
- `MindMapContainer.jsx` — 연결선 위치 기반 좌/우 판별 (isLeftChild)
- `Node.jsx` — handleAddChild direction 자동 결정 (루트: 균형 분배, 비루트: 상속)
- `useKeyboardShortcuts.js` — Enter/Tab 핸들러 direction 로직 추가

**Tests:**
- 438/438 테스트 통과 (split layout 14개 테스트 추가)

### 2026-03-30: 노드 액션 버튼 UX 개선
- **브랜치**: `main`

**UI:**
- `Node.jsx` — `+` 및 `×` 버튼 마우스 호버 시에만 표시

## 알려진 이슈
- 없음

## TODO
1. US-12 테마 시스템 (다크 모드) — 후순위
