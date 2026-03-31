# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 5 진행 중 — 모바일 대응 (기반 구조)
**버전**: v1.0.7
**배포 URL**: https://kokoromap.vercel.app/
**다음 작업**: US-17 마인드맵 테마 시스템

## 최근 작업

### 2026-03-31: 비밀번호 방식 개선 + Vercel 도메인 변경
- **브랜치**: `main`
- **커밋**: 7db0b4c (commit message: 비밀번호 시간 기반(km{HHMM}) + 세션 24시간 연장 (v1.0.5))

**Data Layer:**
- 비밀번호를 사용자 설정 → `km{HHMM}` 시간 기반으로 변경
- 세션 저장소: `sessionStorage` → `localStorage` + 24시간 만료

**UI:**
- 비밀번호 설정 화면 제거 (최초 접속도 바로 입력 화면)

**Integration:**
- 기존 `mindmap-auth-hash` / `sessionStorage` 데이터 자동 정리
- Vercel 프로젝트명 `kokoromap` 변경 → `kokoromap.vercel.app`

### 2026-03-31: 연결선 고급 스타일 구현 (US-16)
- **브랜치**: `main`
- **커밋**: 3f708aa (commit message: 연결선 고급 스타일 구현 (v1.0.6))

**Data Layer:**
- 연결선 설정을 관리하는 `connectionConfig` API 완성
- 화살표, 점선, 두께, 색상 모드 설정 기능 추가

**UI:**
- 설정 패널에 연결선 스타일 제어기 추가
- 실시간 미리보기 기능 제공
- 곡선/직선, 화살표 토글, 색상 선택 UI 구현

**Integration:**
- 툴바에서 직접 연결선 스타일 변경 가능
- 모든 설정이 저장 후 적용됨

### 2026-03-31: 모바일 대응 기반 구조 (Sprint 5 시작)
- **브랜치**: `main`

**Data Layer:**
- `useTouch.js` - 커스텀 터치 이벤트 훅 구현
  - 단일 터치 드래그, 핀치 줌/아웃, 더블 탭, 롱 프레스
  - 모멘텀 스크롤, 스와이프 감지
- `MobileDetector.js` - 디바이스 감지 시스템
  - 화면 크기, 디바이스 타입, 터치 지원 여부 감지

**UI:**
- `MobileToolbar.jsx` - 모바일 최적화 툴바
  - 큰 버튼 (48px), 퀵 액션 바, 하단 도크바
- `MobileDemo.jsx` - 모바일 기능 데모 페이지
- 모바일 반응형 CSS 추가
  - 터치 타겟 크기 보장, 가로 모드 최적화

**Integration:**
- `MindMapContainer.jsx` 터치 이벤트 연동
  - 터치 패닝, 핀치 줌 구현
  - 모바일 툴바 자동 표시
- 테스트 4개 추가 (`mobile-simple.test.js`)

## 알려진 이슈
- FileExporter.test.js, MindMapCSS.test.js 기존 실패 테스트 5개 (본 작업과 무관)
- mobile.test.js - React 훅 테스트 환경 설정 필요 (모의 함수 문제)

## TODO
1. 모바일 대응 상호작용 개선 (드래그 최적화, 핀치 줌) - Sprint 5 진행 중
2. US-18 모바일 상호작용 완성 (드래그 스무딩, 제스처 인터페이스) - Sprint 5 목표
3. US-17 마인드맵 테마 시스템 - 후순위
