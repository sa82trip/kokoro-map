# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11 완료, US-12 진행 예정
**다음 작업**: US-12 테마 시스템 (다크 모드)

## 최근 작업

### 2026-03-30: US-11 키보드 단축키
- **브랜치**: `main`

**Data Layer:**
- `MindMapStore.js` — selectedNodeId를 MindMapContainer에서 스토어로 이관하여 키보드 단축키와 동기화

**UI:**
- `KeyboardShortcutsHelp.jsx` — 단축키 도움말 패널 (? 키 토글, 노드 조작/탐색/일반 3그룹)
- `MindMapContainer.jsx` — 로컬 selectedNodeId → 스토어 selectedNodeId로 교체
- `MindMap.jsx` — useKeyboardShortcuts 훅 연동, KeyboardShortcutsHelp 렌더링

**Integration:**
- `useKeyboardShortcuts.js` — Ctrl+S 저장, ? 도움말 토글 추가. showHelp/saveFeedback 상태 반환

## 알려진 이슈
- 없음

## TODO
1. US-12 테마 시스템 (다크 모드)
2. US-13 연결선 고급 스타일
3. US-14 PNG 내보내기
