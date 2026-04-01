# 마인드맵 앱 - React 마인드맵 에디터

## 현재 상태
**Phase**: 개발 브랜치 전략 및 플로팅 버튼 구현 완료
**버전**: v1.2.1
**production URL**: https://kokoromap.vercel.app/
**development URL**: https://kokoromap-git-development-xxxx.vercel.app/
**다음 작업**: 후순위 개선 (드래그 마우스 추적 정밀도, 이중 스케일링 정리)

## 최근 작업

### 2026-04-01: 개발 브랜치 전략 및 플로팅 버튼 구현
- **브랜치**: `development` → `main`
- **버전**: v1.2.0 → v1.2.1

**UI:**
- `FloatingBranchButton.jsx` — 썸네일 화면 우측하단에 개발 브랜치 정보 플로팅 버튼 추가
- `FloatingBranchButton.css` — 반응형 디자인 및 애니메이션 효과 구현
- Git 브랜치 정보 실시간 표시 (브랜치명, 커밋 해시, 변경 상태)

**Data Layer:**
- `GitUtils.js` — Git 정보 조회 유틸리티 구현
  - `getCurrentBranchInfo()` - 현재 브랜치 정보 가져오기
  - `getDeploymentStatus()` - 배포 URL 및 상태 정보 생성

**Integration:**
- `development` 브랜치 → preview 배포 (Vercel 자동 배포)
- `main` 브랜치 → production 배포
- 플로팅 버튼 상호작용 (마우스 오버 툴팁, 클릭 상세 패널)
- 개발 환경에서 브랜치별 배포 URL 복사 기능

### 2026-04-01: 모바일 배율 조절 UI 추가
- **브랜치**: `main`
- **버전**: v1.1.9 → v1.2.0

**UI:**
- `MobileToolbar.jsx` — 하단 우측 플로팅 ZoomControls 추가 (createPortal 사용)

**Integration:**
- 모바일에서 배율 조절 버튼이 화면 하단 우측에 고정 표시됨

### 2026-04-01: 노드 드래그 시 선 분리 버그 수정
- **브랜치**: `main`
- **버전**: v1.1.8 → v1.1.9

**Data Layer:**
- Node.jsx `updatePosition` — Store에 document-space 좌표(`newPosition / zoomLevel`) 저장
- Node.jsx `handleAddChild` — 자식 노드 위치 계산 시 document-space 변환 추가

**Integration:**
- 드래그 중 로컬 상태는 scaled-space 유지, Store만 document-space로 통일
- `renderConnections`가 `storePos * zoomLevel` 계산 시 노드 위치와 정확히 일치

## 알려진 이슈
- 후순위: zoom ≠ 1에서 노드가 마우스보다 느리게/빠르게 움직임
- 후순위: Node `scale(zoomLevel)` 중복으로 노드 크기가 `zoom²`로 표시

## TODO
1. **완료**: 노드 드래그 시 선 분리 수정
2. **완료**: SPA 새로고침 404 수정
3. **완료**: 모바일 배율 조절 UI 추가
4. **후순위**: 드래그 마우스 추적 정밀도 개선
5. **후순위**: Node/Viewport 이중 스케일링 정리
