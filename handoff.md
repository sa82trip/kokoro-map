# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11, US-13 완료
**다음 작업**: US-14 PNG 내보내기

## 최근 작업

### 2026-03-30: 노드 액션 버튼 UX 개선
- **브랜치**: `main`

**UI:**
- `Node.jsx` — `+` (자식 추가) 및 `×` (삭제) 버튼을 항상 표시 → 마우스 호버 시에만 표시로 변경
- `isHovered` 상태 추가, `onMouseEnter`/`onMouseLeave` 이벤트로 제어

**Tests:**
- 424/424 테스트 통과 (호버 관련 테스트 2개 추가)

### 2026-03-30: US-13 연결선 고급 스타일
- **브랜치**: `main`

**Data Layer:**
- `MindMapStore.js` — `connectionArrow`, `connectionDashed`, `connectionWidth`, `connectionColorMode` 상태 + setter 4개 추가, reset 확장

**UI:**
- `MindMapContainer.jsx` — `renderConnections` 반환 타입 `{ markerDefs, paths }` 로 변경, SVG `<defs>` 마커, 점선, 동적 두께, 브랜치별 색상 상속
- `Toolbar.jsx` — 설정 패널에 화살표/점선/두께/색상모드 4개 섹션 추가, 스크롤 지원

## 알려진 이슈
- 없음

## TODO
1. US-14 PNG 내보내기
2. US-12 테마 시스템 (다크 모드) — 후순위
