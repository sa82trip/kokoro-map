import React from 'react';
import { render, screen } from '@testing-library/react';
import MindMapContainer from './MindMapContainer';
import useMindMapStore from '../../store/MindMapStore';

jest.mock('../../store/MindMapStore');

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('MindMapContainer', () => {
  const mockAddNode = jest.fn();

  beforeEach(() => {
    useMindMapStore.mockReturnValue({ addNode: mockAddNode });
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
});
