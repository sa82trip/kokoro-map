import { createChildNode, createRootNode, getChildNodeColor, COLOR_PALETTE } from './NodeTypes';

// window 모킹
Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('NodeTypes', () => {
  describe('createRootNode', () => {
    test('기본 텍스트로 루트 노드를 생성한다', () => {
      const node = createRootNode();
      expect(node.id).toBe('root');
      expect(node.text).toBe('마인드맵');
      expect(node.color).toBe('#4A90E2');
      expect(node.isRoot).toBe(true);
      expect(node.children).toEqual([]);
    });

    test('커스텀 텍스트로 루트 노드를 생성한다', () => {
      const node = createRootNode('커스텀');
      expect(node.text).toBe('커스텀');
    });
  });

  describe('getChildNodeColor', () => {
    test('파란색 부모에서 자식 색상을 생성한다', () => {
      const color = getChildNodeColor('#4A90E2');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color).not.toBe('#4A90E2'); // 부모와 다른 색상
      expect(color).not.toBe('#52c41a'); // 기존 고정 색상도 아님
    });

    test('같은 부모라도 여러 번 호출하면 다른 색상이 나올 수 있다', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        colors.add(getChildNodeColor('#4A90E2'));
      }
      // 최소 3개 이상의 다른 색상이 나와야 함
      expect(colors.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('createChildNode', () => {
    test('부모 ID로 자식 노드를 생성한다', () => {
      const node = createChildNode('root');
      expect(node.id).toMatch(/^node-/);
      expect(node.text).toBe('새 노드');
      expect(node.isRoot).toBe(false);
      expect(node.parentId).toBe('root');
      expect(node.children).toEqual([]);
    });

    test('자식 노드 색상이 항상 같은 연두색이 아니다', () => {
      const colors = new Set();
      for (let i = 0; i < 10; i++) {
        const node = createChildNode('root');
        colors.add(node.color);
      }
      // 모든 자식이 같은 색상이면 안 됨
      expect(colors.size).toBeGreaterThanOrEqual(2);
    });

    test('자식 노드 색상이 부모와 다르다', () => {
      const node = createChildNode('root', '새 노드', '#4A90E2');
      expect(node.color).not.toBe('#4A90E2');
    });
  });

  describe('COLOR_PALETTE', () => {
    test('50가지 색상이 정의되어 있다', () => {
      expect(COLOR_PALETTE).toBeDefined();
      expect(COLOR_PALETTE).toHaveLength(50);
    });

    test('모든 색상이 #RRGGBB 형식이다', () => {
      COLOR_PALETTE.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('중복 색상이 없다', () => {
      const unique = new Set(COLOR_PALETTE);
      expect(unique.size).toBe(50);
    });

    test('기존 CHILD_COLORS 색상들이 포함되어 있다', () => {
      const CHILD_COLORS = [
        '#E67E22', '#9B59B6', '#1ABC9C', '#E74C3C',
        '#F39C12', '#2ECC71', '#3498DB', '#E91E63',
      ];
      CHILD_COLORS.forEach(color => {
        expect(COLOR_PALETTE).toContain(color);
      });
    });
  });
});
