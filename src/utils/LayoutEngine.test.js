import { calculateAutoLayout, calculateNewChildPosition } from './LayoutEngine';

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('LayoutEngine', () => {
  describe('calculateAutoLayout', () => {
    test('노드에 올바른 위치를 할당한다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, children: [], isRoot: true
      };
      const result = calculateAutoLayout(root);
      expect(result).not.toBeNull();
      expect(result.position).toBeDefined();
      expect(result.position.x).toBeGreaterThan(0);
    });

    test('자식 노드를 부모 오른쪽에 배치한다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [{
          id: 'child1', text: '자식', color: '#E67E22',
          position: { x: 0, y: 0 }, isRoot: false, children: []
        }]
      };
      const result = calculateAutoLayout(root);
      expect(result.children[0].position.x).toBeGreaterThan(result.position.x);
    });

    test('null 입력 시 null을 반환한다', () => {
      expect(calculateAutoLayout(null)).toBeNull();
    });

    test('사용자 정의 gap으로 레이아웃을 계산한다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [{
          id: 'child1', text: '자식', color: '#E67E22',
          position: { x: 0, y: 0 }, isRoot: false, children: []
        }]
      };

      const defaultLayout = calculateAutoLayout(root);
      const wideLayout = calculateAutoLayout(root, { horizontalGap: 200, verticalGap: 60 });

      // 더 넓은 gap이면 자식 x가 더 멀어야 함
      expect(wideLayout.children[0].position.x).toBeGreaterThan(defaultLayout.children[0].position.x);
    });
  });

  describe('calculateNewChildPosition', () => {
    test('부모 오른쪽에 위치를 반환한다', () => {
      const pos = calculateNewChildPosition({ x: 100, y: 200 }, 0);
      expect(pos.x).toBeGreaterThan(100);
      expect(pos.y).toBeGreaterThanOrEqual(200);
    });

    test('기존 자식 수에 따라 y 위치가 증가한다', () => {
      const pos0 = calculateNewChildPosition({ x: 100, y: 200 }, 0);
      const pos1 = calculateNewChildPosition({ x: 100, y: 200 }, 1);
      expect(pos1.y).toBeGreaterThan(pos0.y);
    });

    test('사용자 정의 gap으로 위치를 계산한다', () => {
      const defaultPos = calculateNewChildPosition({ x: 100, y: 200 }, 0);
      const widePos = calculateNewChildPosition({ x: 100, y: 200 }, 0, { horizontalGap: 200, verticalGap: 60 });
      expect(widePos.x).toBeGreaterThan(defaultPos.x);
    });
  });
});
