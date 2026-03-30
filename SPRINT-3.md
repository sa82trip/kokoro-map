# Sprint 3 계획서: 시각적 고급 기능 및 편집 UX

## 기간
- **시작일**: 2026-03-30
- **종료일**: 2026-04-27
- **기간**: 4주

## Sprint 목표
- 편집 UX 핵심 기능 구현 (Undo/Redo, 키보드 단축키)
- 테마 시스템 구축 (라이트/다크 모드)
- 연결선 고급 스타일 (화살표, 점선, 두께)
- PNG 이미지 내보내기

## 기술 배경

### 현재 상태 (Sprint 2 완료 기준)
- **스토어**: MindMapStore (편집 상태) + FileManagerStore (문서/폴더 관리)
- **노드 스타일링**: 폰트 크기/색상/굵기/기울기, 배경색 16색, NodeEditorToolbar
- **연결선**: 베지어/직선 2종류, 전역 색상 변경, 두께 2px 고정
- **내보내기**: JSON 내보내기/가져오기만 가능
- **테마**: 라이트 모드만 지원 (하드코딩 색상)
- **편집 UX**: Undo/Redo 없음, 키보드 단축키 없음
- **테스트**: 346개 단위 + 7개 E2E 테스트 통과

### 주요 변경 사항
1. **Undo/Redo**: MindMapStore에 히스토리 스택 추가
2. **테마 시스템**: ThemeProvider + CSS 변수 기반 라이트/다크 모드
3. **연결선 고급화**: 화살표, 점선, 두께 조절, 브랜치별 색상
4. **PNG 내보내기**: html-to-image 기반 스크린샷 캡처

---

## 사용자 스토리

### US-10: 실행 취소/다시 실행 (Undo/Redo)
- **상태**: `[ ] To Do`
- **우선순위**: 높음
- **점수**: 8
- **기간**: 2일
- **요구사항**:
  - 실행 취소 (Ctrl+Z) / 다시 실행 (Ctrl+Shift+Z)
  - 최대 50단계 히스토리 유지
  - 문서 전환 시 히스토리 초기화
  - Toolbar에 Undo/Redo 버튼 추가
  - 히스토리가 없을 때 버튼 비활성화
- **태스크**:
  - [ ] 10-1: MindMapStore에 history 스택과 pointer 추가
  - [ ] 10-2: pushHistory 액션 구현 (변경 시 자동 기록)
  - [ ] 10-3: undo/redo 액션 구현 (pointer 이동, 상태 복원)
  - [ ] 10-4: Toolbar에 Undo/Redo 버튼 추가 (아이콘 + 단축키 표시)
  - [ ] 10-5: 키보드 이벤트 리스너 등록 (Ctrl+Z, Ctrl+Shift+Z)
  - [ ] 10-6: 문서 전환 시 clearHistory 구현
  - [ ] 10-7: 테스트 작성 (스토어, 단축키, 버튼 활성화 상태)

### US-11: 키보드 단축키
- **상태**: `[ ] To Do`
- **우선순위**: 높음
- **점수**: 5
- **기간**: 1일
- **요구사항**:
  - Delete/Backspace: 선택된 노드 삭제
  - Enter: 선택된 노드의 자식 추가
  - Tab: 선택된 노드의 형제 추가
  - Ctrl+S: 저장
  - Escape: 편집 취소 / 선택 해제
  - 화살표 키: 노드 간 이동 (상하좌우)
  - 단축키 가이드 툴팁 또는 도움말 패널
- **태스크**:
  - [ ] 11-1: useKeyboardShortcuts 커스텀 훅 구현
  - [ ] 11-2: 노드 선택 상태 관리 (MindMapStore에 selectedNodeId 추가)
  - [ ] 11-3: 노드 삭제 단축키 (Delete/Backspace) 연결
  - [ ] 11-4: 노드 추가 단축키 (Enter/Tab) 연결
  - [ ] 11-5: 저장 단축키 (Ctrl+S) 연결
  - [ ] 11-6: 화살표 키 노드 탐색 로직 구현
  - [ ] 11-7: KeyboardShortcutsHelp 패널 컴포넌트 (? 키로 토글)
  - [ ] 11-8: 테스트 작성

### US-12: 테마 시스템 (다크 모드)
- **상태**: `[ ] To Do`
- **우선순위**: 보통
- **점수**: 8
- **기간**: 2일
- **요구사항**:
  - 라이트/다크 테마 전환
  - 테마 설정 localStorage 저장
  - CSS 변수 기반 일관된 테마 적용
  - 시스템 다크 모드 감지 (prefers-color-scheme)
  - 모든 컴포넌트 테마 대응
- **태스크**:
  - [ ] 12-1: ThemeProvider 컨텍스트 + useTheme 훅 구현
  - [ ] 12-2: 라이트/다크 테마 색상 토큰 정의 (CSS 변수)
  - [ ] 12-3: MindMapStore에 theme 상태 추가 (localStorage 동기화)
  - [ ] 12-4: index.css에 CSS 변수 선언 + prefers-color-scheme 미디어 쿼리
  - [ ] 12-5: 모든 컴포넌트 하드코딩 색상 → CSS 변수 마이그레이션
  - [ ] 12-6: Toolbar에 테마 토글 버튼 추가 (햇빛/달 아이콘)
  - [ ] 12-7: 홈 화면 (HomeScreen) 테마 대응
  - [ ] 12-8: 테스트 작성 (ThemeProvider, 토글, localStorage 저장)

### US-13: 연결선 고급 스타일
- **상태**: `[ ] To Do`
- **우선순위**: 보통
- **점수**: 5
- **기간**: 2일
- **요구사항**:
  - 화살표 (Arrow) 표시 옵션
  - 점선 (Dashed) 스타일 옵션
  - 연결선 두께 조절 (1~5px)
  - 브랜치별 연결선 색상 (부모 색상 상속 또는 개별 설정)
  - Settings 패널에 연결선 옵션 추가
- **태스크**:
  - [ ] 13-1: connectionConfig 모델 확장 (arrow, dashed, thickness, inheritColor)
  - [ ] 13-2: MindMapContainer SVG 렌더링 로직 확장 (화살표 마커, 점선, 두께)
  - [ ] 13-3: SVG defs에 arrow 마커 정의
  - [ ] 13-4: Settings 패널에 연결선 옵션 UI 추가
  - [ ] 13-5: 브랜치별 색상 상속 로직 (부모 색상 → 자식 연결선)
  - [ ] 13-6: 테스트 작성

### US-14: PNG 내보내기
- **상태**: `[ ] To Do`
- **우선순위**: 보통
- **점수**: 5
- **기간**: 2일
- **요구사항**:
  - 마인드맵을 PNG 이미지로 내보내기
  - 배경색 옵션 (투명/흰색/현재 테마)
  - 여백(Padding) 설정
  - 해상도 배율 (1x, 2x, 3x)
  - 내보내기 진행 중 로딩 표시
- **태스크**:
  - [ ] 14-1: html-to-image 라이브러리 설치 및 설정
  - [ ] 14-2: FileExporter에 exportToPNG 함수 추가
  - [ ] 14-3: ExportDialog 컴포넌트 구현 (배경, 여백, 해상도 옵션)
  - [ ] 14-4: Toolbar 내보내기 버튼에 PNG 옵션 추가
  - [ ] 14-5: 캡처 대상 DOM 영역 계산 로직 (노드 전체 포함)
  - [ ] 14-6: 테스트 작성

---

## 아키텍처 변경 계획

### 데이터 모델 확장

```javascript
// MindMapStore 추가 상태
{
  // Undo/Redo
  history: [],           // 과거 상태 스냅샷 배열
  historyIndex: -1,      // 현재 히스토리 포인터
  maxHistory: 50,        // 최대 히스토리 수

  // 노드 선택
  selectedNodeId: null,  // 현재 선택된 노드 ID

  // 테마
  theme: 'light',        // 'light' | 'dark' | 'system'

  // 연결선 설정 확장
  connectionConfig: {
    style: 'bezier',       // 'bezier' | 'straight'
    color: '#b0b8c8',      // 기본 색상
    arrow: false,          // 화살표 표시
    dashed: false,         // 점선 여부
    thickness: 2,          // 두께 (1~5)
    inheritColor: false,   // 부모 노드 색상 상속
  }
}
```

### 컴포넌트 구조 (변경 후)
```
App
├── ThemeProvider (신규)
│   ├── HomeScreen (테마 대응)
│   │   ├── SearchBar (테마 대응)
│   │   ├── FolderTree (테마 대응)
│   │   ├── RecentDocumentList (테마 대응)
│   │   └── DocumentCard (테마 대응)
│   └── MindMapEditor
│       ├── Toolbar (확장 — Undo/Redo, 테마 토글, PNG 내보내기)
│       ├── KeyboardShortcutsHelp (신규)
│       ├── ExportDialog (신규)
│       └── MindMapContainer (확장 — 고급 연결선)
│           ├── SVG connections (확장 — 화살표, 점선, 두께)
│           └── Node (테마 대응)
```

### 유틸리티 추가/변경
```
utils/
├── FileExporter.js        (확장 — PNG 내보내기 추가)
├── ThemeManager.js        (신규 — 테마 토큰, 시스템 감지)
└── ShortcutManager.js     (신규 — 단축키 등록/해제 관리)

hooks/
└── useKeyboardShortcuts.js (신규 — 키보드 단축키 훅)
```

### CSS 변수 (테마)
```css
:root {
  /* Light Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-canvas: linear-gradient(to bottom right, #f5f7fa, #c3cfe2);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --toolbar-bg: #ffffff;
  --sidebar-bg: #f7fafc;
  --card-bg: #ffffff;
  --hover-bg: #edf2f7;
}

[data-theme="dark"] {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --bg-canvas: linear-gradient(to bottom right, #1a202c, #2d3748);
  --text-primary: #e2e8f0;
  --text-secondary: #a0aec0;
  --border-color: #4a5568;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  --toolbar-bg: #2d3748;
  --sidebar-bg: #1a202c;
  --card-bg: #2d3748;
  --hover-bg: #4a5568;
}
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
- [ ] html-to-image 라이브러리 성능 (대규모 마인드맵 시 메모리)
- [ ] 다크 모드 전환 시 기존 노드 색상 가독성
- [ ] Undo/Redo 히스토리 메모리 관리 (대규모 트리)

## 차단 요소
- [ ] 없음

## 계획
- **1주차 (3/30 ~ 4/5)**: US-10 Undo/Redo + US-11 키보드 단축키 (편집 UX 기반)
- **2주차 (4/6 ~ 4/12)**: US-12 테마 시스템 (다크 모드)
- **3주차 (4/13 ~ 4/19)**: US-13 연결선 고급 스타일 + US-14 PNG 내보내기
- **4주차 (4/20 ~ 4/27)**: 통합 테스트, 버그 수정, UI 폴리싱

---

**생성일**: 2026-03-30
**담당자**: AI Assistant
