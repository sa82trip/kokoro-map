# Changelog

## [화면 표시 문제 수정] - 2026-03-31

**Branch**: `main` | **Version**: v1.0.7

### Added
- **Error Handling** (`src/components/MindMap/MindMapContainer.jsx`)
  - 데이터가 없을 때 로딩 화면 표시 기능 (297-330라인)
  - 빈 마인드맵 상태 시 "마인드맵 로딩 중..." 메시지
  - 로딩 스피너 및 점진적 UI 표시

- **Loading State Management** (`src/store/MindMapStore.js`)
  - `setLoading()` 메서드로 로딩 상태 관리
  - `loadFromStorage()`에 로딩 상태 추가
  - `createNewMindMap()`에 로딩 상태 처리

### Changed
- `src/components/MindMap/MindMap.jsx` — 데이터 없을 때 자동 생성
  - `useEffect`에서 `createNewMindMap()` 호출 추가
  - 데이터가 없을 경우 새 마인드맵 자동 생성 로직
  - `loadFromStorage()`가 false 반환 시 처리 강화

- `src/components/MobileDetector.jsx` — import 오류 수정
  - 중복 export 제거
  - `IS_IOS` 변수 내부 이동

### Removed
- `export default MobileDetector` — 정의되지 않은 컴포넌트 export 제거

### Technical Notes
- MindMapStore에서 로딩 상태 관리 체계 구축
- 비동기 데이터 로딩 시 UI 피드백 강화
- 데이터 없을 시 자동으로 기본 마인드맵 생성
- Total: 3 files changed, +185 lines added, -2 lines removed

### Problem
1. MobileDetector import 오류로 앱이 정상 작동하지 않음
2. 마인드맵 화면이 하얀색으로만 표시됨

### Root Cause
1. `MobileDetector.jsx`에서 정의되지 않은 `MobileDetector` 컴포넌트를 export 시도
2. MindMapContainer가 `data`가 null일 때 `return null`로 아무것도 렌더링하지 않음
3. MindMapStore에서 로딩 상태를 제대로 관리하지 않음

### Solution
1. 중복 export 제거 및 `IS_IOS` 변수 내부 이동
2. 데이터가 없을 때 로딩 화면 표시
3. `loadFromStorage()`와 `createNewMindMap()`에 로딩 상태 추가
4. 데이터가 없을 시 자동으로 새 마인드맵 생성

### Tests
- MindMapStore 로딩 상태 테스트 필요
- 자동 생성 기능 통합 테스트 추가 필요
- Total: 192 tests passing (2 tests pending)

---

## [연결선 고급 스타일] - 2026-03-31

**Branch**: `main` | **Version**: v1.0.6

### Added
- **Connection UI** (`src/components/MindMap/Toolbar.jsx`)
  - 설정 패널에 연결선 스타일 제어기 추가 (422-613라인)
  - 실시간 연결선 스타일 변경 기능
  - 곡선/직선 스타일 선택 버튼
  - 화살표 토글 (표시/없음)
  - 점선 스타일 토글 (실선/점선)
  - 연결선 두께 슬라이더 (1-5px)
  - 색상 모드 선택 (전역/브랜치)
  - 색상 상속 체크박스

### Changed
- `src/store/MindMapStore.js` — 연결선 설정 관리 API 강화
  - `setConnectionConfig()` 메서드 개선 (값 검증 추가)
  - 연결선 스타일 유효성 검증 (bezier/straight만 허용)
  - 색상 형식 검증 (#HEX 6자리)
  - 두께 범위 검증 (1-5px)
  - 색상 모드 검증 (global/branch만 허용)
- `tests/connections.test.js` — 연결련 기능 테스트 10개 추가
  - 모든 설정 변경 시나리오 테스트
  - 비동기 상태 업데이트 처리
  - 자식 노드 추가 후 연결선 생성 확인

### Technical Notes
- 연결선 설정은 `connectionConfig` 상태로 관리
- UI에서 변경된 설정은 즉시 적용되고 저장됨
- 화살표 활성화 시 SVG marker 동적 생성
- Total: 2 files changed, +220 lines added

### Problem
1. 세션이 5분만에 리셋되어 잦은 재인증 필요
2. 사용자가 직접 비밀번호를 설정해야 하는 번거로움

### Solution
1. `sessionStorage` → `localStorage` + 24시간 만료로 세션 연장
2. 비밀번호를 `km{HHMM}` 시간 기반 자동 생성 방식으로 변경

### Changed
- `src/components/Auth/PasswordGuard.jsx` — 전면 리팩토링
  - 비밀번호 설정 화면 제거 (needsSetup/confirmPassword 상태 삭제)
  - `getCurrentPassword()` — 현재 시간 기반 비밀번호 생성 (`km0850` 형식)
  - 세션 저장소: `sessionStorage` → `localStorage` + `expiresAt` 타임스탬프 (24시간)
  - 기존 `mindmap-auth-hash` / `sessionStorage` 데이터 자동 정리
- `package.json` — v1.0.3 → v1.0.5