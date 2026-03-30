# US-14-5: PNG 내보내기 테스트

## 작업 내용
PNG 내보내기 기능에 대한 통합 테스트를 작성합니다.

## 상태
**[ ] 설계 완료**

## 구현 사항
- PNG 내보내기 단위 테스트
- 다양한 옵션 조합 통합 테스트
- 실제 파일 다운로드 시뮬레이션 테스트

## 테스트 케이스
```javascript
// tests/export.test.js
describe('PNG 내보내기', () => {
  beforeEach(() => {
    // 테스트용 마인드맵 생성
    createTestMindMap();
  });

  test('기본 PNG 내보내기', async () => {
    const container = document.getElementById('mindmap-container');
    const blob = await exportToPNG(container);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  test('배경색 옵션 테스트', async () => {
    const container = document.getElementById('mindmap-container');

    const transparent = await exportToPNG(container, { background: 'transparent' });
    const white = await exportToPNG(container, { background: 'white' });
    const theme = await exportToPNG(container, { background: 'theme' });

    expect(transparent.type).toBe('image/png');
    expect(white.type).toBe('image/png');
    expect(theme.type).toBe('image/png');
  });

  test('여백 설정 테스트', async () => {
    const container = document.getElementById('mindmap-container');

    const padding0 = await exportToPNG(container, { padding: 0 });
    const padding50 = await exportToPNG(container, { padding: 50 });

    // 더 큰 여백일 경우 파일 크기가 커져야 함
    expect(padding50.size).toBeGreaterThan(padding0.size);
  });

  test('해상도 배율 테스트', async () => {
    const container = document.getElementById('mindmap-container');

    const scale1x = await exportToPNG(container, { scale: 1 });
    const scale2x = await exportToPNG(container, { scale: 2 });
    const scale3x = await exportToPNG(container, { scale: 3 });

    // 배율이 클수록 파일 크기가 커짐
    expect(scale3x.size).toBeGreaterThan(scale2x.size);
    expect(scale2x.size).toBeGreaterThan(scale1x.size);
  });

  test('대형 마인드맵 성능 테스트', async () => {
    // 100개 노드 생성
    createLargeMindMap(100);
    const container = document.getElementById('mindmap-container');

    const startTime = performance.now();
    await exportToPNG(container, { scale: 1 });
    const endTime = performance.now();

    // 5초 내 완료
    expect(endTime - startTime).toBeLessThan(5000);
  });
});
```

## 통합 테스트 시나리오
1. [ ] 기본 내보내기 테스트
2. [ ] 모든 배경 옵션 조합 테스트
3. [ ] 여백 값 변화 테스트
4. [ ] 해상도 배율 테스트
5. [ ] 대형 마인드맵 성능 테스트
6. [ ] UI에서 내보내기 클릭 → 파일 다운로드 전체 흐름 테스트

## 테스트 데이터
```javascript
// 테스트용 마인드맵 생성 함수
const createTestMindMap = () => {
  // 트리 구조 생성 로직
  const root = {
    id: 'root',
    text: '루트 노드',
    children: [
      { id: 'child1', text: '자식 노드 1', children: [] },
      { id: 'child2', text: '자식 노드 2', children: [] }
    ]
  };

  // 스토어에 데이터 설정
  useMindMap.getState().setData(root);
};
```

## 실행 방법
```bash
# 모든 PNG 내보내기 테스트 실행
npm test -- --testNamePattern="PNG 내보내기"

# 성능 테스트만 실행
npm test -- --testNamePattern="대형 마인드맵 성능 테스트"
```