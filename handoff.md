# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 완료 — 비밀번호 보호 기능 개선 + 도메인 변경
**버전**: v1.0.5
**배포 URL**: https://kokoromap.vercel.app/
**다음 작업**: US-16 연결선 고급 스타일 (화살표, 점선)

## 최근 작업

### 2026-03-31: 비밀번호 방식 개선 + Vercel 도메인 변경
- **브랜치**: `main`

**Data Layer:**
- 비밀번호를 사용자 설정 → `km{HHMM}` 시간 기반으로 변경
- 세션 저장소: `sessionStorage` → `localStorage` + 24시간 만료

**UI:**
- 비밀번호 설정 화면 제거 (최초 접속도 바로 입력 화면)

**Integration:**
- 기존 `mindmap-auth-hash` / `sessionStorage` 데이터 자동 정리
- Vercel 프로젝트명 `kokoromap` 변경 → `kokoromap.vercel.app`

## 알려진 이슈
- FileExporter.test.js, MindMapCSS.test.js 기존 실패 테스트 5개 (본 작업과 무관)

## TODO
1. US-16 연결선 고급 스타일 (화살표, 점선) — 후순위
