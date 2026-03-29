# 마인드맵 앱 - React + Zustand 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 1 — 기본 마인드맵 생성 및 편집 (95% 완료)
**다음 작업**: US-4 시각적 기본 기능 개발

## 최근 작업

### 2026-03-29: US-3 노드 편집 기능 + 버그 수정

- **커밋**: (예정)

**Data Layer:**
- `DEFAULT_NODE_STYLE` 상수 — fontSize, textColor, fontWeight, fontStyle 기본값
- `ITreeNode`/`NodeSchema`에 style 속성 추가
- `MindMapStore.updateNodeStyle()` — 노드 스타일 업데이트 + 유효성 검증
- `createRootNode`/`createChildNode`에 style 기본값 포함
- `TextMeasurer.js` 공유 유틸 — Canvas 기반 텍스트 크기 측정 (캐시 포함)

**UI:**
- `NodeEditorToolbar` — 폰트 크기 슬라이더, Bold/Italic 토글, 12색 텍스트 색상 피커
- 더블클릭 편집 모드 진입
- `isSelected` prop 기반 툴바 표시/숨김, 외부 클릭 시 자동 닫힘
- Canvas 텍스트 측정 → 노드 박스 자동 크기 조절
- 디바운스 자동 저장 (300ms)
- 연결선 동적 노드 크기 반영

**Bug Fix:**
- React Hooks 순서 위반 수정 — `useEffect`가 early return 뒤에 있던 문제
- `renderConnections`에서 `node.position` 미사용 → 연결선 위치 계산 수정
- `TextMeasurer` named export 지원 (`export {}` + `export default`)
- `localStorage` 마이그레이션 — 기존 데이터에 style 필드 자동 추가
- `.includes()` → `indexOf` 변경 (core-js 미설치 환경 호환)
- `MindMapContainer` 불필요한 닫는 괄호 제거

## 알려진 이슈
- 없음 (테스트 98/98 통과 중)

## TODO
1. **US-4 시각적 기본 기능** (7 포인트)
   - 색상 팔레트 (50가지)
   - 노드 배경색 변경
   - 연결선 스타일/색상 변경
   - 노드 간 거리 조절
   - 전체 레이아웃 재조정
2. Sprint 1 완료 후 Sprint 1 Handoff 보고서 작성
