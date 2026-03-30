# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 2 진행 중 — US-8 검색 및 필터링 완료
**다음 작업**: US-9 폴더 구조 관리

## 최근 작업

### 2026-03-30: US-8 검색 및 필터링 (전체 완료)
- **브랜치**: `main`

**Data Layer:**
- `src/store/FileManagerStore.js` — searchQuery, dateFilter, sortBy, searchInContent 상태 및 getFilteredDocuments 액션 추가. searchInNodeTree 헬퍼 추가
- `src/types/DocumentTypes.js` — updateDocumentMeta에서 루트 노드 텍스트로 title 자동 갱신

**UI:**
- `src/components/Home/SearchBar.jsx` + `SearchBar.css` — 검색 입력창, 지우기 버튼, 노드 내용 검색 토글
- `src/components/Home/FilterDropdown.jsx` + `FilterDropdown.css` — 기간 필터 + 정렬 드롭다운
- `src/components/Home/DocumentCard.jsx` — highlight prop, 검색어 하이라이트(mark 태그)
- `src/components/Home/RecentDocumentList.jsx` — getFilteredDocuments 사용, 검색 결과 없음 UI
- `src/components/Home/HomeScreen.jsx` — SearchBar + FilterDropdown 통합

## 알려진 이슈
- 없음

## TODO
1. US-9: 폴더 구조 관리
