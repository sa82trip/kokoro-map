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

    test('direction=left이면 부모 왼쪽에 위치를 반환한다', () => {
      const pos = calculateNewChildPosition({ x: 500, y: 200 }, 0, undefined, 'left');
      expect(pos.x).toBeLessThan(500);
    });

    test('direction이 없으면 기본적으로 오른쪽 위치를 반환한다', () => {
      const pos = calculateNewChildPosition({ x: 100, y: 200 }, 0, undefined);
      expect(pos.x).toBeGreaterThan(100);
    });
  });

  describe('Split Layout', () => {
    test('홀수 개 자식이 좌우로 분산된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [
          { id: 'c1', text: 'A', color: '#E67E22', position: { x: 0, y: 0 }, isRoot: false, children: [] },
          { id: 'c2', text: 'B', color: '#9B59B6', position: { x: 0, y: 0 }, isRoot: false, children: [] },
          { id: 'c3', text: 'C', color: '#1ABC9C', position: { x: 0, y: 0 }, isRoot: false, children: [] },
        ]
      };
      const result = calculateAutoLayout(root);
      expect(result.children[0].direction).toBe('right');
      expect(result.children[1].direction).toBe('left');
      expect(result.children[2].direction).toBe('right');
      // 좌측 자식은 루트보다 x가 작아야 함
      expect(result.children[1].position.x).toBeLessThan(result.position.x);
      // 우측 자식은 루트보다 x가 커야 함
      expect(result.children[0].position.x).toBeGreaterThan(result.position.x);
      expect(result.children[2].position.x).toBeGreaterThan(result.position.x);
    });

    test('좌측 자식의 서브트리가 더 왼쪽으로 확장된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [{
          id: 'left1', text: 'L', color: '#E67E22', direction: 'left',
          position: { x: 0, y: 0 }, isRoot: false,
          children: [{
            id: 'gc1', text: 'GC', color: '#9B59B6',
            position: { x: 0, y: 0 }, isRoot: false, children: []
          }]
        }]
      };
      const result = calculateAutoLayout(root);
      expect(result.children[0].position.x).toBeLessThan(result.position.x);
      expect(result.children[0].children[0].position.x).toBeLessThan(result.children[0].position.x);
    });

    test('우측 자식의 서브트리가 더 오른쪽으로 확장된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [{
          id: 'right1', text: 'R', color: '#E67E22', direction: 'right',
          position: { x: 0, y: 0 }, isRoot: false,
          children: [{
            id: 'gc1', text: 'GC', color: '#9B59B6',
            position: { x: 0, y: 0 }, isRoot: false, children: []
          }]
        }]
      };
      const result = calculateAutoLayout(root);
      expect(result.children[0].position.x).toBeGreaterThan(result.position.x);
      expect(result.children[0].children[0].position.x).toBeGreaterThan(result.children[0].position.x);
    });

    test('루트 노드가 화면 중앙에 배치된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true, children: []
      };
      const result = calculateAutoLayout(root);
      // innerWidth=1024, centerX = 1024/2 - 200/2 = 412
      expect(result.position.x).toBe(412);
    });

    test('명시적 direction이 있는 노드는 자동 할당 시 유지된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [
          { id: 'c1', text: 'A', color: '#E67E22', direction: 'left', position: { x: 0, y: 0 }, isRoot: false, children: [] },
          { id: 'c2', text: 'B', color: '#9B59B6', direction: 'right', position: { x: 0, y: 0 }, isRoot: false, children: [] },
        ]
      };
      const result = calculateAutoLayout(root);
      expect(result.children[0].direction).toBe('left');
      expect(result.children[1].direction).toBe('right');
    });

    test('좌측과 우측 서브트리가 독립적으로 수직 정렬된다', () => {
      const root = {
        id: 'root', text: '루트', color: '#4A90E2',
        position: { x: 0, y: 0 }, isRoot: true,
        children: [
          { id: 'r1', text: 'R1', color: '#E67E22', position: { x: 0, y: 0 }, isRoot: false, children: [] },
          { id: 'l1', text: 'L1', color: '#9B59B6', position: { x: 0, y: 0 }, isRoot: false, children: [] },
          { id: 'r2', text: 'R2', color: '#1ABC9C', position: { x: 0, y: 0 }, isRoot: false, children: [] },
        ]
      };
      const result = calculateAutoLayout(root);
      const rightNodes = result.children.filter(c => c.direction === 'right');
      const leftNodes = result.children.filter(c => c.direction === 'left');
      expect(rightNodes.length).toBe(2);
      expect(leftNodes.length).toBe(1);
      // 우측 노드들이 서로 다른 y 위치
      expect(rightNodes[1].position.y).toBeGreaterThan(rightNodes[0].position.y);
    });
  });
});
