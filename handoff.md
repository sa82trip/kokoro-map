# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11, US-13, US-14, US-15, Split Layout 완료
**버전**: v1.0.1
**다음 작업**: US-12 테마 시스템 (다크 모드)

## 최근 작업

### 2026-03-31: 노드 이름 변경 단축키 + 버전 표시 + Vercel 배포
- **브랜치**: `main`

**Data Layer:**
- `MindMapStore.js` — `editingNodeId` 상태, `setEditingNodeId` 액션 추가

**UI:**
- `useKeyboardShortcuts.js` — F2 / C 키로 노드 이름 변경 (편집 모드 진입)
- `Node.jsx` — store `editingNodeId` 감지 → 로컬 `isEditing` 활성화
- `KeyboardShortcutsHelp.jsx` — F2 / C 단축키 도움말 추가
- `HomeScreen.jsx` + `MindMap.jsx` — 화면 하단 버전 표시 (package.json import)

**배포:**
- Vercel CLI 설치 및 프로젝트 연결 (sa82trip/kokoro-map → Vercel 자동 배포)

**Tests:**
- 36/36 키보드 단축키 테스트 통과 (F2, C, Shift+C 편집 모드 테스트 추가)

### 2026-03-31: US-14 PNG 내보내기 + 다이얼로그 버그 수정
- **브랜치**: `main`

## 알려진 이슈
- FileExporter.test.js, MindMapCSS.test.js 기존 실패 테스트 5개 (본 작업과 무관)

## TODO
1. US-12 테마 시스템 (다크 모드) — 후순위
