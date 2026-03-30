import React from 'react';
import { render, screen } from '@testing-library/react';
import MindMapContainer from './MindMapContainer';
import useMindMapStore from '../../store/MindMapStore';

jest.mock('../../store/MindMapStore');
jest.mock('../../utils/TextMeasurer', () => ({
  measureText: jest.fn(() => ({ width: 200, height: 80 }))
}));

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('MindMapContainer', () => {
  const mockAddNode = jest.fn();
  const mockDeleteNode = jest.fn();

  const defaultMockState = {
    addNode: mockAddNode,
    deleteNode: mockDeleteNode,
    connectionStyle: 'bezier',
    connectionColor: '#b0b8c8',
    connectionArrow: false,
    connectionDashed: false,
    connectionWidth: 2,
    connectionColorMode: 'global',
    viewport: { x: 0, y: 0 },
    setViewport: jest.fn(),
    selectedNodeId: null,
    setSelectedNodeId: jest.fn(),
    toolbarNodeId: null,
    setToolbarNodeId: jest.fn()
  };

  const setupMock = (overrides = {}) => {
    const state = { ...defaultMockState, ...overrides };
    useMindMapStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  };

  beforeEach(() => {
    setupMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('data가 null이면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<MindMapContainer data={null} />);
    expect(container.innerHTML).toBe('');
  });

  // === 연결선 테스트 ===
  describe('연결선 렌더링', () => {
    const dataWithChildren = {
      id: 'root',
      text: '루트',
      color: '#4A90E2',
      position: { x: 400, y: 300 },
      children: [
        {
          id: 'child-1',
          text: '자식1',
          color: '#E67E22',
          position: { x: 650, y: 200 },
          children: [],
          isRoot: false
        },
        {
          id: 'child-2',
          text: '자식2',
          color: '#9B59B6',
          position: { x: 650, y: 400 },
          children: [],
          isRoot: false
        }
      ],
      isRoot: true
    };

    test('부모-자식 노드 사이에 SVG 연결선이 렌더링된다', () => {
      const { container } = render(<MindMapContainer data={dataWithChildren} />);

      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();

      const paths = container.querySelectorAll('svg path');
      expect(paths.length).toBe(2); // 자식 2개 → 선 2개
    });

    test('루트 노드만 있으면 연결선이 없다', () => {
      const rootOnly = {
        id: 'root',
        text: '루트',
        color: '#4A90E2',
        position: { x: 400, y: 300 },
        children: [],
        isRoot: true
      };

      const { container } = render(<MindMapContainer data={rootOnly} />);

      const lines = container.querySelectorAll('svg path');
      expect(lines.length).toBe(0);
    });

    test('깊은 자식 노드에도 연결선이 렌더링된다', () => {
      const deepData = {
        id: 'root',
        text: '루트',
        color: '#4A90E2',
        position: { x: 400, y: 300 },
        children: [
          {
            id: 'child-1',
            text: '자식1',
            color: '#E67E22',
            position: { x: 650, y: 200 },
            children: [
              {
                id: 'grandchild-1',
                text: '손자1',
                color: '#1ABC9C',
                position: { x: 900, y: 200 },
                children: [],
                isRoot: false
              }
            ],
            isRoot: false
          }
        ],
        isRoot: true
      };

      const { container } = render(<MindMapContainer data={deepData} />);

      const lines = container.querySelectorAll('svg path');
      expect(lines.length).toBe(2); // root→child-1, child-1→grandchild-1
    });
  });

  // === 연결선 고급 스타일 테스트 ===
  describe('연결선 고급 스타일', () => {
    const sampleData = {
      id: 'root',
      text: '루트',
      color: '#4A90E2',
      position: { x: 400, y: 300 },
      children: [
        {
          id: 'child-1',
          text: '자식1',
          color: '#E67E22',
          position: { x: 650, y: 200 },
          children: [],
          isRoot: false
        }
      ],
      isRoot: true
    };

    const multiLevelData = {
      id: 'root',
      text: '루트',
      color: '#4A90E2',
      position: { x: 400, y: 300 },
      children: [
        {
          id: 'child-1',
          text: '자식1',
          color: '#E67E22',
          position: { x: 650, y: 200 },
          children: [
            {
              id: 'grandchild-1',
              text: '손자1',
              color: '#1ABC9C',
              position: { x: 900, y: 200 },
              children: [],
              isRoot: false
            }
          ],
          isRoot: false
        }
      ],
      isRoot: true
    };

    test('화살표 활성화 시 marker 요소와 markerEnd 속성이 설정된다', () => {
      setupMock({ connectionArrow: true });

      const { container } = render(<MindMapContainer data={sampleData} />);

      const markers = container.querySelectorAll('svg marker');
      expect(markers.length).toBe(1);

      const paths = container.querySelectorAll('svg path');
      expect(paths[0].getAttribute('marker-end')).toMatch(/^url\(#arrowhead-/);
    });

    test('화살표 비활성화 시 marker 요소가 없다', () => {
      const { container } = render(<MindMapContainer data={sampleData} />);

      const markers = container.querySelectorAll('svg marker');
      expect(markers.length).toBe(0);
    });

    test('점선 활성화 시 strokeDasharray 속성이 설정된다', () => {
      setupMock({ connectionDashed: true });

      const { container } = render(<MindMapContainer data={sampleData} />);

      const paths = container.querySelectorAll('svg path');
      expect(paths[0].getAttribute('stroke-dasharray')).toBe('8 4');
    });

    test('점선 비활성화 시 strokeDasharray 속성이 없다', () => {
      const { container } = render(<MindMapContainer data={sampleData} />);

      const paths = container.querySelectorAll('svg path');
      expect(paths[0].getAttribute('stroke-dasharray')).toBeNull();
    });

    test('연결선 두께가 반영된다', () => {
      setupMock({ connectionWidth: 4 });

      const { container } = render(<MindMapContainer data={sampleData} />);

      const paths = container.querySelectorAll('svg path');
      expect(paths[0].getAttribute('stroke-width')).toBe('4');
    });

    test('브랜치 색상 모드 시 부모 노드 색상을 상속한다', () => {
      setupMock({ connectionColorMode: 'branch' });

      const { container } = render(<MindMapContainer data={multiLevelData} />);

      const paths = container.querySelectorAll('svg path');
      // root(#4A90E2) → child-1: 루트 색상
      expect(paths[0].getAttribute('stroke')).toBe('#4A90E2');
      // child-1(#E67E22) → grandchild-1: 자식1 색상
      expect(paths[1].getAttribute('stroke')).toBe('#E67E22');
    });

    test('전역 색상 모드 시 connectionColor를 사용한다', () => {
      const { container } = render(<MindMapContainer data={sampleData} />);

      const paths = container.querySelectorAll('svg path');
      expect(paths[0].getAttribute('stroke')).toBe('#b0b8c8');
    });

    test('모든 고급 스타일 조합이 정상 동작한다', () => {
      setupMock({
        connectionColor: '#FF0000',
        connectionArrow: true,
        connectionDashed: true,
        connectionWidth: 3,
        connectionColorMode: 'branch'
      });

      const { container } = render(<MindMapContainer data={multiLevelData} />);

      const paths = container.querySelectorAll('svg path');
      expect(paths.length).toBe(2);

      // 첫 번째 연결선 (root → child-1)
      expect(paths[0].getAttribute('stroke')).toBe('#4A90E2'); // 브랜치 모드
      expect(paths[0].getAttribute('stroke-width')).toBe('3');
      expect(paths[0].getAttribute('stroke-dasharray')).toBe('8 4');
      expect(paths[0].getAttribute('marker-end')).toMatch(/^url\(#arrowhead-/);

      // 두 번째 연결선 (child-1 → grandchild-1)
      expect(paths[1].getAttribute('stroke')).toBe('#E67E22');

      // 마커 정의 2개 (색상별)
      const markers = container.querySelectorAll('svg marker');
      expect(markers.length).toBe(2);
    });
  });
});
