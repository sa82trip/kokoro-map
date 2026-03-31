# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 4 완료 — 연결선 고급 스타일 구현
**버전**: v1.0.6
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

## 알려진 이슈
- FileExporter.test.js, MindMapCSS.test.js 기존 실패 테스트 5개 (본 작업과 무관)

## TODO
1. US-17 마인드맵 테마 시스템
