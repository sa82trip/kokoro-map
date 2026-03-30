# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 2 진행 중 — US-5 캔버스 패닝 + 드래그 버그 수정 완료
**다음 작업**: US-6 파일 저장 및 불러오기 착수

## 최근 작업

### 2026-03-30: US-5 노드 드래그 버그 수정 (3가지 원인)
- **브랜치**: `main`

**Validator (`src/utils/NodeValidator.js`):**
- position 제한 `0~4096` → `-4096~4096` 확장 (음수 좌표 허용)

**UI (`src/components/MindMap/MindMap.jsx`):**
- 에러 발생 시 전체 화면 전환 → 에러 배너 + 닫기 버튼으로 변경

**UI (`src/components/MindMap/MindMapContainer.jsx`):**
- SVG에 `overflow: visible` 추가 (연결선 잘림 방지)

**Store (`src/store/MindMapStore.js`):**
- `updateNodePosition`에서 무거운 validation/localStorage 저장 제거
- `saveNodePositions` 액션 추가 (drag end 시만 저장)

**Node (`src/components/MindMap/Node.jsx`):**
- drag end 시 `saveNodePositions()` 호출

**테스트:**
- Playwright E2E 테스트 도입 (7개 테스트)
- 단위 테스트 mock에 `saveNodePositions` 추가
- jest.config.js에 `/e2e/` 제외 패턴 추가

## 알려진 이슈
- 없음

## TODO
1. US-6: 파일 저장 및 불러오기 (스토리지 리팩토링, JSON 내보내기/가져오기)
2. US-7: 최근 문서 관리 (홈 화면, 문서 카드, 라우팅)
3. US-8: 검색 및 필터링
4. US-9: 폴더 구조 관리
