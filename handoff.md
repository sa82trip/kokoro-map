# 마인드맵 앱 - React 마인드맵 에디터

## 현재 상태
**Phase**: 노드 드래그 시 선 분리 버그 수정 + SPA 라우팅 수정 완료
**버전**: v1.1.9
**배포 URL**: https://kokoromap.vercel.app/
**다음 작업**: 모든 배율에서 드래그/선 동작 확인 → 후순위 개선 (드래그 마우스 추적 정밀도)

## 최근 작업

### 2026-04-01: 노드 드래그 시 선 분리 버그 수정
- **브랜치**: `main`
- **버전**: v1.1.8 → v1.1.9

**Data Layer:**
- Node.jsx `updatePosition` — Store에 document-space 좌표(`newPosition / zoomLevel`) 저장
- Node.jsx `handleAddChild` — 자식 노드 위치 계산 시 document-space 변환 추가

**Integration:**
- 드래그 중 로컬 상태는 scaled-space 유지, Store만 document-space로 통일
- `renderConnections`가 `storePos * zoomLevel` 계산 시 노드 위치와 정확히 일치

### 2026-04-01: SPA 라우팅 404 수정
- **브랜치**: `main`
- **버전**: v1.1.7 → v1.1.8

**Integration:**
- vercel.json에 SPA rewrite 규칙 추가: `/(.*) → /index.html`

## 알려진 이슈
- 해결 완료: 드래그 중 선-노드 분리
- 후순위: zoom ≠ 1에서 노드가 마우스보다 느리게/빠르게 움직임
- 후순위: Node `scale(zoomLevel)` 중복으로 노드 크기가 `zoom²`로 표시

## TODO
1. **완료**: 노드 드래그 시 선 분리 수정
2. **완료**: SPA 새로고침 404 수정
3. **후순위**: 드래그 마우스 추적 정밀도 개선
4. **후순위**: Node/Viewport 이중 스케일링 정리
