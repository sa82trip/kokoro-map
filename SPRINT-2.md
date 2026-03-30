# Sprint 2 계획서: 파일 관리 및 저장 시스템

## 기간
- **시작일**: 2026-03-30
- **종료일**: 2026-04-27
- **기간**: 4주

## Sprint 목표
- 마인드맵 다중 문서 저장/불러오기 시스템 구현
- localStorage 기반 파일 관리 시스템 (다중 문서 지원)
- JSON 내보내기/가져오기 기능
- 최근 문서, 검색/필터링, 폴더 관리 UI 구현

## 기술 배경

### 현재 상태 (Sprint 1 완료 기준)
- **저장 방식**: 단일 localStorage 키 (`mindmap-app-data`)에 1개 마인드맵만 저장
- **데이터 모델**: 트리 구조 노드 (id, text, color, position, children, style)
- **스토어**: Zustand 기반 (MindMapStore.js)
- **컴포넌트**: MindMap > Toolbar + MindMapContainer > Node 구조
- **테스트**: 124개 통과 / 9개 테스트 스위트

### 주요 변경 사항
1. **스토리지 리팩토링**: 단일 키 → 다중 문서 관리 시스템
2. **새 데이터 모델**: 문서 메타데이터, 폴더 구조
3. **새 컴포넌트**: FileManager, SearchBar, FolderTree
4. **스토어 분리**: MindMapStore + FileManagerStore

---

## 사용자 스토리

### US-5: 캔버스 패닝 (Canvas Panning)
- **상태**: `[ ] To Do`
- **우선순위**: 높음
- **점수**: 5
- **기간**: 1일
- **요구사항**:
  - 캔버스 배경 드래그로 화면 이동 (pan)
  - 화면 밖 노드 접근 가능
  - 노드 드래그와 패닝 구분 (배경 vs 노드)
  - "중앙 이동" 버튼으로 원점 복귀
  - 패닝 상태에서 노드 드래그 좌표 정확성 유지
- **태스크**:
  - [ ] 5-1: Store에 viewport 상태 및 액션 추가 (panViewport, setViewport, resetViewport)
  - [ ] 5-2: MindMapContainer에 transform 래퍼 + 패닝 이벤트 핸들러 구현
  - [ ] 5-3: Node 드래그 좌표 변환 (viewportOffset prop)
  - [ ] 5-4: Toolbar에 "중앙 이동" 버튼 추가
  - [ ] 5-5: 테스트 작성 (Store, MindMapContainer, Node)

### US-6: 파일 저장 및 불러오기
- **상태**: `[ ] To Do`
- **우선순위**: 높음
- **점수**: 8
- **기간**: 3일
- **요구사항**:
  - localStorage 다중 문서 저장 (각 문서 개별 키)
  - JSON 파일 내보내기 (다운로드)
  - JSON 파일 가져오기 (업로드)
  - 문서 메타데이터 관리 (id, 제목, 생성일, 수정일, 썸네일)
  - 자동 저장 기능 유지
- **태스크**:
  - [ ] 6-1: 스토리지 레이어 리팩토링 — 단일 키 → 다중 문서 관리
  - [ ] 6-2: 문서 메타데이터 모델 정의 (DocumentMeta 타입)
  - [ ] 6-3: FileManagerStore 생성 (문서 CRUD, 활성 문서 관리)
  - [ ] 6-4: JSON 내보내기 유틸리티 (파일 다운로드)
  - [ ] 6-5: JSON 가져오기 유틸리티 (파일 업로드 + 검증)
  - [ ] 6-6: Toolbar에 저장/내보내기/가져오기 버튼 추가
  - [ ] 6-7: 기존 단일 저장 데이터 마이그레이션

### US-7: 최근 문서 관리
- **상태**: `[ ] To Do`
- **우선순위**: 높음
- **점수**: 5
- **기간**: 2일
- **요구사항**:
  - 최근 문서 목록 UI (홈 화면)
  - 문서 썸네일 표시
  - 작업 시간 기록 (생성일, 최근 수정일)
  - 목록에서 파일 선택 시 자동 로드
  - 최근 문서 20개 제한
  - 문서 삭제 기능
- **태스크**:
  - [ ] 7-1: 홈/시작 화면 컴포넌트 (HomeScreen)
  - [ ] 7-2: 문서 카드 컴포넌트 (DocumentCard — 썸네일, 제목, 날짜)
  - [ ] 7-3: 최근 문서 목록 컴포넌트 (RecentDocumentList)
  - [ ] 7-4: 문서 삭제 기능 (확인 다이얼로그 포함)
  - [ ] 7-5: 라우팅 추가 (홈 ↔ 에디터 전환)

### US-8: 검색 및 필터링
- **상태**: `[ ] To Do`
- **우선순위**: 보통
- **점수**: 5
- **기간**: 2일
- **요구사항**:
  - 검색창 UI
  - 제목으로 검색
  - 키워드 전체 검색 (노드 내용 포함)
  - 날짜별 필터링 (오늘, 이번 주, 이번 달)
  - 정렬 기능 (최근순, 이름순, 생성순)
  - 검색 결과 하이라이트
- **태스크**:
  - [ ] 8-1: 검색 입력 컴포넌트 (SearchBar)
  - [ ] 8-2: 검색/필터 로직 구현 (FileManagerStore 확장)
  - [ ] 8-3: 필터 드롭다운 컴포넌트 (날짜별, 정렬)
  - [ ] 8-4: 검색 결과 하이라이트 적용
  - [ ] 8-5: 빈 결과 상태 UI

### US-9: 폴더 구조 관리
- **상태**: `[ ] To Do`
- **우선순위**: 보통
- **점수**: 8
- **기간**: 3일
- **요구사항**:
  - 폴더 생성/이름 변경/삭제
  - 문서를 폴더로 이동
  - 폴더 계층 표시 (최대 3단계)
  - 폴더 아이콘 (열림/닫힘 상태)
  - 사이드바 폴더 트리 UI
- **태스크**:
  - [ ] 9-1: 폴더 데이터 모델 정의 (Folder 타입)
  - [ ] 9-2: 폴더 CRUD 로직 (FileManagerStore 확장)
  - [ ] 9-3: 폴더 트리 사이드바 컴포넌트 (FolderTree)
  - [ ] 9-4: 폴더 생성 다이얼로그
  - [ ] 9-5: 문서 이동 기능 (드래그앤드롭 또는 선택 UI)
  - [ ] 9-6: 폴더 컨텍스트 메뉴 (이름 변경, 삭제)

---

## 아키텍처 변경 계획

### 데이터 모델

```
Storage Keys:
  mindmap-docs/index      → DocumentMeta[] (문서 메타데이터 인덱스)
  mindmap-docs/folders    → Folder[] (폴더 구조)
  mindmap-docs/{docId}    → MindMapData (개별 문서 데이터)
  mindmap-app-data        → (기존 — 마이그레이션 후 제거)
```

### DocumentMeta
```javascript
{
  id: string,           // 고유 문서 ID (uuid)
  title: string,        // 문서 제목
  folderId: string|null,// 소속 폴더 ID
  createdAt: string,    // ISO 8601
  updatedAt: string,    // ISO 8601
  nodeCount: number,    // 노드 수
  thumbnail: string     // 썸네일 (선택)
}
```

### Folder
```javascript
{
  id: string,           // 고유 폴더 ID
  name: string,         // 폴더명
  parentId: string|null,// 부모 폴더 ID (최대 3단계)
  createdAt: string,    // ISO 8601
  order: number         // 정렬 순서
}
```

### 컴포넌트 구조 (변경 후)
```
App (React Router 추가)
├── HomeScreen (신규)
│   ├── SearchBar (신규)
│   ├── FolderTree (신규 — 사이드바)
│   ├── RecentDocumentList (신규)
│   │   └── DocumentCard (신규)
│   └── FilterDropdown (신규)
└── MindMapEditor (기존 MindMap 리팩토링)
    ├── Toolbar (확장 — 저장/내보내기/가져오기)
    └── MindMapContainer
        ├── SVG connections
        └── Node (재귀)
```

### 스토어 구조
```
stores/
├── MindMapStore.js        (기존 — 문서 편집 상태만 관리)
└── FileManagerStore.js    (신규 — 문서/폴더 CRUD, 검색, 필터)
```

### 유틸리티 추가
```
utils/
├── StorageManager.js      (신규 — 다중 문서 localStorage 관리)
├── FileExporter.js        (신규 — JSON/PNG 내보내기)
├── FileImporter.js        (신규 — JSON 가져오기 + 검증)
└── DocumentUtils.js       (신규 — 문서 메타데이터 유틸)
```

---

## Sprint 백로그
- 총 스토리: 5개
- 총 점수: 31점
- 예상 완료일: 2026-04-20

## 현재 진행률
- **완료된 스토리**: 0개
- **완료된 점수**: 0점
- **진행률**: 0%

## 리스크
- [ ] localStorage 용량 제한 (보통 5~10MB) — 대규모 마인드맵 시 문제 가능
- [ ] 기존 데이터 마이그레이션 호환성
- [ ] 다중 문서 전환 시 상태 관리 복잡도 증가

## 차단 요소
- [ ] 없음

## 계획
- **1주차 (3/30 ~ 4/5)**: US-5 캔버스 패닝 + US-6 파일 저장/불러오기 (핵심 인프라)
- **2주차 (4/6 ~ 4/12)**: US-7 최근 문서 관리 (홈 화면)
- **3주차 (4/13 ~ 4/19)**: US-8 검색/필터링 + US-9 폴더 구조
- **4주차 (4/20 ~ 4/27)**: 통합 테스트, 버그 수정, UI 폴리싱

---

**생성일**: 2026-03-30
**담당자**: AI Assistant
