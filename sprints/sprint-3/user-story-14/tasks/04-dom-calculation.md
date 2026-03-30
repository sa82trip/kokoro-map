# US-14-4: 캡처 대상 DOM 영역 계산

## 작업 내용
마인드맵 전체를 캡처하기 위해 적절한 DOM 영역을 계산하는 로직을 구현합니다.

## 상태
**[ ] 설계 완료** → **[x] 완료**

## 구현 사항
- 마인드맙 컨테너의 전체 크기 계산
- 여백(padding)을 고려한 캡처 영역 확장
- 스크롤 위치 기반 노드 위치 보정
- 드래그 중인 노드가 있을 때의 예외 처리

## 계산 로직
```javascript
// FileExporter.js (확장)
export const calculateCaptureArea = (container, padding = 20) => {
  // 1. 모든 노드의 위치 정보 수집
  const nodes = container.querySelectorAll('.node');
  const nodePositions = Array.from(nodes).map(node => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  });

  // 2. 모든 노드를 포함하는 영역 계산
  const minX = Math.min(...nodePositions.map(n => n.x));
  const minY = Math.min(...nodePositions.map(n => n.y));
  const maxX = Math.max(...nodePositions.map(n => n.x + n.width));
  const maxY = Math.max(...nodePositions.map(n => n.y + n.height));

  // 3. 여백 추가
  const captureRect = {
    left: minX - padding,
    top: minY - padding,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding
  };

  return captureRect;
};

export const exportToPNG = async (element, config = {}) => {
  // ... 기존 설정

  // 캡처 영역 계산
  const captureRect = calculateCaptureArea(element, config.padding);

  // 옵션에 captureRect 추가
  const options = {
    // ... 기존 옵션들
    width: captureRect.width,
    height: captureRect.height,
    filter: (node) => {
      // SVG 연결선은 항상 포함
      if (node.classList?.contains('connection')) return true;
      // 노드만 캡처 (툴바 등 제외)
      return node.classList?.contains('node') ||
             node.classList?.contains('connection');
    }
  };

  return await toPng(element, options);
};
```

## 테스트
- [x] 여백 적용 시 이미지 크기 계산 테스트
- [x] 다양한 레이아웃에서 캡처 영역 테스트
- [ ] 대형 마인드맵에서 성능 테스트
- [ ] 연결선과 노드 모두 캡처되는지 테스트