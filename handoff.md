# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11 완료, 툴바 UX 개선 완료
**다음 작업**: US-12 테마 시스템 (다크 모드)

## 최근 작업

### 2026-03-30: 노드 설정 툴바 UX 개선
- **브랜치**: `main`

**Data Layer:**
- `MindMapStore.js` — `toolbarNodeId` 상태 추가, `setSelectedNodeId`에서 다른 노드 선택 시 툴바 자동 닫힘

**UI:**
- `Node.jsx` — `showToolbar` prop으로 툴바 표시 제어 (기존 `isSelected`에서 분리)
- `MindMapContainer.jsx` — `showToolbar`, `onToggleToolbar` props 연결, 클릭 외부 시 툴바 닫힘
- `useKeyboardShortcuts.js` — Space 키로 툴바 토글, 화살표 이동 시 툴바 닫힘
- `KeyboardShortcutsHelp.jsx` — Space 단축키 설명 추가

**Interaction:**
- 클릭 → 노드 선택만, 다시 클릭 → 툴바 열기/닫기
- 키보드 화살표 → 이동 (툴바 닫힘), Space → 툴바 열기/닫기
- Escape → 툴바 + 선택 해제

**Tests:**
- 396/396 테스트 통과 (신규 8개 추가)

## 알려진 이슈
- 없음

## TODO
1. US-12 테마 시스템 (다크 모드)
2. US-13 연결선 고급 스타일
3. US-14 PNG 내보내기
