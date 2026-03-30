# 마인드맵 프로젝트 - React 마인드맵 에디터

## 현재 상태
**Phase**: Sprint 3 완료 — 비밀번호 보호 기능 추가
**버전**: v1.0.3
**다음 작업**: US-16 연결선 고급 스타일 (화살표, 점선)

## 최근 작업

### 2026-03-31: 비밀번호 보호 기능 추가
- **브랜치**: `main`

**Data Layer:**
- Web Crypto API SHA-256 해시로 비밀번호 저장
- `localStorage`에 비밀번호 해시 저장 (최초 1회 설정)
- `sessionStorage`로 세션 유지 (브라우저 탭 닫으면 재인증 필요)

**UI:**
- `PasswordGuard.jsx` — 인증 가드 컴포넌트 (App.jsx 최상위 래핑)
- 잠금 화면: 자물쇠 아이콘 + 비밀번호 입력 모달
- 최초 접속 시 비밀번호 설정 화면 (4자 이상 + 확인 입력)
- 비밀번호 보기 토글 체크박스

**Integration:**
- `App.jsx` — `<PasswordGuard>`로 전체 앱 래핑

## 알려진 이슈
- FileExporter.test.js, MindMapCSS.test.js 기존 실패 테스트 5개 (본 작업과 무관)

## TODO
1. US-16 연결선 고급 스타일 (화살표, 점선) — 후순위
