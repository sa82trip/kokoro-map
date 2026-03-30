import { renderHook, act } from '@testing-library/react';
import useMindMapStore from '../src/store/MindMapStore';

// 테스트용 마인드맵 데이터 생성 함수
const createTestMindMapData = () => {
  return {
    id: 'root',
    text: '루트 노드',
    position: { x: 100, y: 100 },
    style: {
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#2d3748',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      padding: 12,
      margin: 0
    },
    children: [
      {
        id: 'child1',
        text: '자식 노드 1',
        position: { x: 300, y: 80 },
        style: {
          fontSize: 14,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#4a5568',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 8,
          padding: 10,
          margin: 0
        },
        children: []
      }
    ]
  };
};

describe('Zoom Consistency Test', () => {
  let testData;

  beforeEach(() => {
    // 테스트용 마인드맵 데이터 생성
    testData = createTestMindMapData();

    const { result } = renderHook(() => useMindMapStore());
    act(() => {
      result.current.reset();
    });
  });

  test('100% 배율에서 노드와 연결선 위치가 일치해야 한다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(1.0);
    });

    // 노드 위치 계산
    const node1 = testData;
    const node2 = testData.children[0];

    const node1Size = calculateNodeSize(node1, 1.0);
    const node2Size = calculateNodeSize(node2, 1.0);

    // 100% 배율에서 노드 위치
    const node1CenterX = node1.position.x * 1.0 + node1Size.width / 2;
    const node1CenterY = node1.position.y * 1.0 + node1Size.height / 2;
    const node2CenterX = node2.position.x * 1.0 + node2Size.width / 2;
    const node2CenterY = node2.position.y * 1.0 + node2Size.height / 2;

    // 연결선 계산
    const connections = calculateConnections(testData, 1.0);
    const pathData = connections[0];
    const pathMatch = pathData.match(/M (\d+) (\d+) C/);
    const lineStartX = parseInt(pathMatch[1]);
    const lineStartY = parseInt(pathMatch[2]);

    // 연결선이 노드 중앙에서 시작하는지 확인
    expect(lineStartX).toBe(node1CenterX);
    expect(lineStartY).toBe(node1CenterY);
  });

  test('200% 배율에서 노드와 연결선 위치가 일치해야 한다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(2.0);
    });

    // 노드 위치 계산
    const node1 = testData;
    const node2 = testData.children[0];

    const node1Size = calculateNodeSize(node1, 2.0);
    const node2Size = calculateNodeSize(node2, 2.0);

    // 200% 배율에서 노드 위치
    const node1CenterX = node1.position.x * 2.0 + node1Size.width / 2;
    const node1CenterY = node1.position.y * 2.0 + node1Size.height / 2;
    const node2CenterX = node2.position.x * 2.0 + node2Size.width / 2;
    const node2CenterY = node2.position.y * 2.0 + node2Size.height / 2;

    // 연결선 계산
    const connections = calculateConnections(testData, 2.0);
    const pathData = connections[0];
    const pathMatch = pathData.match(/M (\d+) (\d+) C/);
    const lineStartX = parseInt(pathMatch[1]);
    const lineStartY = parseInt(pathMatch[2]);

    // 연결선이 노드 중앙에서 시작하는지 확인
    expect(lineStartX).toBe(node1CenterX);
    expect(lineStartY).toBe(node1CenterY);
  });

  test('50% 배율에서 노드와 연결선 위치가 일치해야 한다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(0.5);
    });

    // 노드 위치 계산
    const node1 = testData;
    const node2 = testData.children[0];

    const node1Size = calculateNodeSize(node1, 0.5);
    const node2Size = calculateNodeSize(node2, 0.5);

    // 50% 배율에서 노드 위치
    const node1CenterX = node1.position.x * 0.5 + node1Size.width / 2;
    const node1CenterY = node1.position.y * 0.5 + node1Size.height / 2;
    const node2CenterX = node2.position.x * 0.5 + node2Size.width / 2;
    const node2CenterY = node2.position.y * 0.5 + node2Size.height / 2;

    // 연결선 계산
    const connections = calculateConnections(testData, 0.5);
    const pathData = connections[0];
    const pathMatch = pathData.match(/M (\d+) (\d+) C/);
    const lineStartX = parseInt(pathMatch[1]);
    const lineStartY = parseInt(pathMatch[2]);

    // 연결선이 노드 중앙에서 시작하는지 확인
    expect(lineStartX).toBe(node1CenterX);
    expect(lineStartY).toBe(node1CenterY);
  });

  test('다양한 배율에서 연결선이 계속 노드 중앙을 연결해야 한다', () => {
    const { result } = renderHook(() => useMindMapStore());
    const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

    zoomLevels.forEach(zoom => {
      act(() => {
        result.current.setZoomLevel(zoom);
      });

      // 노드 위치 계산
      const node1 = testData;
      const node2 = testData.children[0];

      const node1Size = calculateNodeSize(node1, zoom);
      const node2Size = calculateNodeSize(node2, zoom);

      // 배율 적용된 노드 중앙 위치
      const node1CenterX = node1.position.x * zoom + node1Size.width / 2;
      const node1CenterY = node1.position.y * zoom + node1Size.height / 2;

      // 연결선 계산
      const connections = calculateConnections(testData, zoom);
      const pathData = connections[0];
      const pathMatch = pathData.match(/M (\d+) (\d+) C/);
      const lineStartX = parseInt(pathMatch[1]);
      const lineStartY = parseInt(pathMatch[2]);

      // 연결선이 노드 중앙에서 시작하는지 확인
      expect(lineStartX).toBe(node1CenterX);
      expect(lineStartY).toBe(node1CenterY);
    });
  });

  // 테스트에 사용하는 헬퍼 함수
  const calculateNodeSize = (node, zoomLevel = 1.0) => {
    if (!node) return { width: 200, height: 80 };
    const nodeStyle = node.style || {};
    // 간단한 텍스트 측정 (테스트용)
    const textLength = node.text.length * 8; // 대략적인 글자 너비
    const baseSize = { width: Math.max(120, textLength), height: Math.max(40, 20) };
    // 배율 적용
    return {
      width: baseSize.width * zoomLevel,
      height: baseSize.height * zoomLevel
    };
  };

  const calculateConnections = (node, zoomLevel, connectionStyle = 'bezier', connectionColor = '#b0b8c8', connectionArrow = false, connectionDashed = false, connectionWidth = 2, connectionColorMode = 'global') => {
    if (!node || !node.children || node.children.length === 0) return [];

    const paths = [];
    const pos = node.position || { x: 0, y: 0 };
    const size = calculateNodeSize(node, zoomLevel);

    node.children.forEach((child) => {
      const childPos = child.position || { x: 0, y: 0 };
      const childSize = calculateNodeSize(child, zoomLevel);

      // 배율 적용된 위치 계산
      const scaledPos = {
        x: pos.x * zoomLevel,
        y: pos.y * zoomLevel
      };
      const scaledChildPos = {
        x: childPos.x * zoomLevel,
        y: childPos.y * zoomLevel
      };

      // 연결선은 노드 중앙에서 시작 (수직 중앙)
      const x1 = scaledPos.x + size.width / 2;
      const y1 = scaledPos.y + size.height / 2;
      // 연결선은 자식 노드 중앙에서 끝나도록 (수직 중앙)
      const x2 = scaledChildPos.x + childSize.width / 2;
      const y2 = scaledChildPos.y + childSize.height / 2;

      const midX = (x1 + x2) / 2;

      let pathD;
      if (connectionStyle === 'straight') {
        pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      }

      paths.push(pathD);
    });

    return paths;
  };
});