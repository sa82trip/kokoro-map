# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 2 완료 — 모든 이슈 해결됨
**다음 작업**: Sprint 3 계획 수립

## 최근 작업

### 2026-03-30: FolderPickerDialog 계층 구분 표시 수정
- **브랜치**: `main` (커밋: 39c4b8a)
- DFS 트리 순회로 부모-자식 순서 정렬
- `getFolderDepth` 기반 들여쓰기 (depth * 20px)
- 테스트 3개 추가 (346/346 통과)

### 2026-03-30: US-9 폴더 구조 관리 + 버그 수정
- **브랜치**: `main`

**Data Layer:**
- `src/types/FolderTypes.js` — Folder 모델, createFolder, updateFolder, validateFolder, getFolderDepth, MAX_FOLDER_DEPTH(3)
- `src/utils/StorageManager.js` — loadFolders, saveFolders, hasFolders (mindmap-docs/folders 키)
- `src/store/FileManagerStore.js` — folders, activeFolderId 상태 + 5개 액션 + getFilteredDocuments 폴더 필터

**UI:**
- `FolderTree.jsx` — 사이드바 폴더 트리 (전체 문서, 확장/접힘, 활성 표시, 우클릭 컨텍스트 메뉴, 하위 폴더 만들기)
- `FolderCreateDialog.jsx` — 폴더 생성/이름변경 모달 (create/rename 모드)
- `FolderContextMenu.jsx` — 우클릭 메뉴 (하위 폴더 만들기, 이름 변경, 삭제)
- `FolderPickerDialog.jsx` — 문서 이동 다이얼로그 (계층 구분 들여쓰기 포함)

**Integration:**
- `HomeScreen.jsx` — .home-body flex 레이아웃 (FolderTree 사이드바 + 메인 콘텐츠)
- `RecentDocumentList.jsx` — activeFolderId 구독, 폴더 빈 상태
- `DocumentCard.jsx` — 폴더 태그(folderName), 이동 버튼, FolderPickerDialog 연동

## 알려진 이슈
- 없음

## TODO
1. Sprint 3 계획 수립
