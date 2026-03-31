# 마인드맵 앱 - React 마인드맵 에디터

## 현재 상태
**Phase**: 모바일 노드 터치 드래그 수정 완료
**버전**: v1.1.7
**배포 URL**: https://kokoromap.vercel.app/
**다음 작업**: 아이폰 실기 테스트 후 배포 → Sprint 6 계획

## 최근 작업

### 2026-03-31: 모바일 노드 터치 드래그 수정
- **브랜치**: `main`
- **버전**: v1.1.6 → v1.1.7

**Data Layer:**
- MindMapStore — `isNodeDragging` 플래그 및 `setIsNodeDragging` 액션 추가

**UI:**
- Node.jsx — 터치 드래그 시작/종료 시 `isNodeDragging` 플래그 설정
- MindMapContainer.jsx — `handleTouchMove`에서 `isNodeDragging` 체크하여 노드 드래그 중 캔버스 패닝 무시

**Integration:**
- 노드 터치 시 `stopPropagation()` + `isNodeDragging` 플래그로 이중 보호

## 알려진 이슈
- 해결 완료: 터치 패닝/핀치줌 정상 작동
- 해결 완료: 모바일 노드 크기/간격 최적화
- 해결 완료: 노드 터치 드래그와 캔버스 패닝 충돌

## TODO
1. **완료**: LayoutEngine 모바일 노드 크기 지원
2. **완료**: 모바일 자동 레이아웃 초기화
3. **완료**: 액션 버튼 터치 타겟 확대
4. **완료**: CSS 모바일 최적화
5. **완료**: 노드 터치 드래그 수정
6. **진행**: 아이폰 실기 테스트 후 배포
