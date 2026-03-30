# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 2 진행 중 — US-7 최근 문서 관리 완료
**다음 작업**: US-8 검색 및 필터링

## 최근 작업

### 2026-03-30: US-7 최근 문서 관리 (전체 완료)
- **브랜치**: `main`

**Data Layer:**
- `package.json` — react-router-dom 의존성 추가
- `jest.setup.js` — TextEncoder/TextDecoder polyfill 추가 (react-router-dom 호환)

**UI:**
- `src/components/Home/HomeScreen.jsx` — 홈 화면 (헤더, 새 마인드맵 버튼, RecentDocumentList)
- `src/components/Home/HomeScreen.css` — 헤더 sticky, 버튼 스타일, 반응형
- `src/components/Home/DocumentCard.jsx` — 문서 카드 (썸네일, 메타, 삭제 확인 오버레이)
- `src/components/Home/DocumentCard.css` — 카드 스타일 (호버, 오버레이, 반응형)
- `src/components/Home/RecentDocumentList.jsx` — 최근 문서 목록 (updatedAt 정렬, 최대 20개)
- `src/components/Home/RecentDocumentList.css` — 그리드 레이아웃, 반응형

**Integration:**
- `src/main.jsx` — BrowserRouter로 App 감싸기
- `src/App.jsx` — Routes 설정 (`/` HomeScreen, `/editor/:docId` MindMapEditor)
- `src/components/MindMap/MindMapEditor.jsx` — URL docId 기반 문서 로드/생성 에디터 래퍼
- 라우팅: `/` (홈), `/editor/new` (새 문서), `/editor/:docId` (기존 문서), `*` → `/`

## 알려진 이슈
- 없음

## TODO
1. US-8: 검색 및 필터링
2. US-9: 폴더 구조 관리
