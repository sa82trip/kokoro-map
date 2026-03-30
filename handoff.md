# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10 완료, US-11 진행 중
**다음 작업**: US-11 키보드 단축키 완료 → US-12 테마 시스템

## 최근 작업

### 2026-03-30: US-10 실행 취소/다시 실행 (Undo/Redo)
- **브랜치**: `main`

**Data Layer:**
- `MindMapStore.js` — undoStack, redoStack 상태 추가. _pushHistory, undo, redo, canUndo, canRedo, clearHistory 액션. 드래그 시 _preDragSnapshot 캡처. 모든 mutation 액션에 _pushHistory 연동. selectedNodeId 상태 추가

**UI:**
- `Toolbar.jsx` — Undo/Redo 버튼 (비활성화 상태 시각적 표시). Ctrl+Z / Ctrl+Shift+Z 키보드 단축키 리스너

**Integration:**
- `useKeyboardShortcuts.js` — 키보드 단축키 훅 (US-11 진행 중)

## 알려진 이슈
- 없음

## TODO
1. US-11 키보드 단축키 완료
2. US-12 테마 시스템 (다크 모드)
3. US-13 연결선 고급 스타일
4. US-14 PNG 내보내기
