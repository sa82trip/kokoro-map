# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 2 진행 중 — US-6 파일 저장 및 불러오기 완료
**다음 작업**: US-7 최근 문서 관리 (홈 화면, 라우팅)

## 최근 작업

### 2026-03-30: US-6 파일 저장 및 불러오기
- **브랜치**: `main`

**Data Layer:**
- `src/types/DocumentTypes.js` — DocumentMeta 모델, 팩토리, 검증
- `src/utils/StorageManager.js` — 다중 키 localStorage 관리
- `src/store/FileManagerStore.js` — 문서 CRUD + 레거시 마이그레이션 Zustand 스토어
- `src/utils/FileExporter.js` — JSON 내보내기 (Blob 다운로드)
- `src/utils/FileImporter.js` — JSON 가져오기 (FileReader + 검증)
- `src/store/MindMapStore.js` — storage 객체 제거 → FileManagerStore 연동

**UI:**
- `src/components/MindMap/Toolbar.jsx` — 저장/내보내기/가져오기 버튼 추가
- `src/components/MindMap/MindMap.jsx` — FileManagerStore.initialize() 호출

**Integration:**
- 레거시 마이그레이션 (mindmap-app-data → mindmap-docs/*)
- Export envelope: { version: 1, exportedAt, meta, data }
- Import: JSON 파싱 → 버전 확인 → validateMindMap 검증

## 알려진 이슈
- 없음

## TODO
1. US-7: 최근 문서 관리 (홈 화면, 문서 카드, react-router 라우팅)
2. US-8: 검색 및 필터링
3. US-9: 폴더 구조 관리
