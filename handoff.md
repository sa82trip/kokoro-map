# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 진행 중 — US-10, US-11 완료, US-12 진행 예정
**다음 작업**: US-12 테마 시스템 (다크 모드)

## 최근 작업

### 2026-03-30: 버그 수정 (선택 시각 + 키보드 노드 생성)
- **브랜치**: `main`
- **커밋**: 45252ce

**UI:**
- `Node.jsx` — 선택 시각 표시를 `border`에서 `box-shadow ring`으로 개선 (파란색 글로우)
- `useKeyboardShortcuts.js` — Enter/Tab 키 `calculateNewChildPosition` 인자 수정

**Tests:**
- `KeyboardShortcuts.test.js` — 인자 타입 검증 테스트 2개 추가 (Enter, Tab)
- `Node.test.jsx` — border → box-shadow 테스트 업데이트

## 알려진 이슈
- 없음

## TODO
1. US-12 테마 시스템 (다크 모드)
2. US-13 연결선 고급 스타일
3. US-14 PNG 내보내기
