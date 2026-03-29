import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Node from '../src/components/MindMap/Node';
import useMindMapStore from '../src/store/MindMapStore';

// Zustand store 모킹
jest.mock('../src/store/MindMapStore');
jest.mock('../src/utils/TextMeasurer', () => ({
  measureText: jest.fn(() => ({ width: 200, height: 80 }))
}));
const mockUseMindMapStore = useMindMapStore;

// Mock window 객체
Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true
});
Object.defineProperty(window, 'innerHeight', {
  value: 1080,
  writable: true
});

describe('Node Component', () => {
  const mockNode = {
    id: 'test-node',
    text: 'Test Node',
    color: '#4A90E2',
    position: { x: 100, y: 100 },
    children: [],
    isRoot: false
  };

  const mockUpdateNodeText = jest.fn();
  const mockUpdateNodePosition = jest.fn();
  const mockUpdateNodeStyle = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockUseMindMapStore.mockReturnValue({
      updateNodeText: mockUpdateNodeText,
      updateNodePosition: mockUpdateNodePosition,
      updateNodeStyle: mockUpdateNodeStyle
    });
    mockUpdateNodeText.mockClear();
    mockUpdateNodePosition.mockClear();
    mockUpdateNodeStyle.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('렌더링 시 노드가 표시되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  test('노드가 올바른 위치에 렌더링되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    expect(nodeElement.style.left).toBe('100px');
    expect(nodeElement.style.top).toBe('100px');
  });

  test('노드 색상이 올바르게 적용되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    expect(nodeElement.style.backgroundColor).toBe('rgb(74, 144, 226)');
  });

  test('더블클릭 시 편집 모드로 전환되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.dblClick(nodeElement);
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
  });

  test('텍스트 변경 시 디바운스 저장이 호출되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.dblClick(nodeElement);
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });

    // 디바운스 타이머 실행
    act(() => { jest.advanceTimersByTime(300); });
    expect(mockUpdateNodeText).toHaveBeenCalledWith('test-node', 'Updated Text');
  });

  test('Enter 키로 편집이 완료되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.dblClick(nodeElement);
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Node')).not.toBeInTheDocument();
  });

  test('Esc 키로 편집 취소가 가능해야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.dblClick(nodeElement);

    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  test('드래그 시 document 레벨에서 위치가 업데이트되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 300, clientY: 250 });

    expect(mockUpdateNodePosition).toHaveBeenCalledWith('test-node', { x: 200, y: 200 });
  });

  test('document 레벨 mouseup으로 드래그가 종료되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(document);

    mockUpdateNodePosition.mockClear();
    fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
    expect(mockUpdateNodePosition).not.toHaveBeenCalled();
  });

  test('드래그 중 transition이 비활성화되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

    expect(nodeElement.style.transition).toBe('none');
  });

  test('input/textarea에서 드래그가 시작되지 않아야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.dblClick(nodeElement);
    const input = screen.getByDisplayValue('Test Node');

    fireEvent.mouseDown(input);
    fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });

    expect(mockUpdateNodePosition).not.toHaveBeenCalled();
  });

  test('자식 추가 버튼이 렌더링되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  test('추가 버튼 클릭 시 onAddChild를 호출해야 합니다', () => {
    const mockOnAddChild = jest.fn();
    render(<Node node={mockNode} position={mockNode.position} onAddChild={mockOnAddChild} />);

    fireEvent.click(screen.getByText('+'));
    expect(mockOnAddChild).toHaveBeenCalled();
    expect(mockOnAddChild.mock.calls[0][0]).toBe('test-node');
  });

  test('root 노드도 정상적으로 렌더링되어야 합니다', () => {
    const rootNode = { ...mockNode, isRoot: true, text: 'Root Node' };
    render(<Node node={rootNode} position={rootNode.position} />);
    expect(screen.getByText('Root Node')).toBeInTheDocument();
  });

  test('유효하지 않은 위치도 그대로 렌더링되어야 합니다', () => {
    const invalidPosition = { x: -100, y: -100 };
    render(<Node node={mockNode} position={invalidPosition} />);

    const nodeElement = screen.getByTestId('node-container');
    expect(nodeElement.style.left).toBe('-100px');
    expect(nodeElement.style.top).toBe('-100px');
  });

  test('선택된 노드는 테두리가 표시되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

    const nodeElement = screen.getByTestId('node-container');
    expect(nodeElement.style.border).toContain('3px solid #1890ff');
  });

  test('선택되지 않은 노드는 테두리가 없어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} isSelected={false} />);

    const nodeElement = screen.getByTestId('node-container');
    expect(nodeElement.style.border).toBe('');
  });

  // === US-3: 노드 편집 기능 테스트 ===
  describe('US-3: 노드 편집 기능', () => {
    test('isSelected=true일 때 편집 툴바가 표시되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      expect(screen.getByTestId('node-editor-toolbar')).toBeInTheDocument();
    });

    test('isSelected=false일 때 툴바가 표시되지 않아야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={false} />);

      expect(screen.queryByTestId('node-editor-toolbar')).not.toBeInTheDocument();
    });

    test('폰트 크기 슬라이더가 렌더링되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      expect(screen.getByTestId('font-size-slider')).toBeInTheDocument();
    });

    test('Bold 버튼이 렌더링되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      expect(screen.getByTestId('bold-button')).toBeInTheDocument();
    });

    test('Italic 버튼이 렌더링되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      expect(screen.getByTestId('italic-button')).toBeInTheDocument();
    });

    test('폰트 크기 변경 시 updateNodeStyle이 호출되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      const slider = screen.getByTestId('font-size-slider');
      fireEvent.change(slider, { target: { value: 24 } });

      expect(mockUpdateNodeStyle).toHaveBeenCalledWith('test-node', { fontSize: 24 });
    });

    test('Bold 토글 시 updateNodeStyle이 호출되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      fireEvent.click(screen.getByTestId('bold-button'));
      expect(mockUpdateNodeStyle).toHaveBeenCalledWith('test-node', { fontWeight: 'bold' });
    });

    test('Italic 토글 시 updateNodeStyle이 호출되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      fireEvent.click(screen.getByTestId('italic-button'));
      expect(mockUpdateNodeStyle).toHaveBeenCalledWith('test-node', { fontStyle: 'italic' });
    });

    test('텍스트 색상 변경 시 updateNodeStyle이 호출되어야 합니다', () => {
      render(<Node node={mockNode} position={mockNode.position} isSelected={true} />);

      fireEvent.click(screen.getByTestId('color-E74C3C'));
      expect(mockUpdateNodeStyle).toHaveBeenCalledWith('test-node', { textColor: '#E74C3C' });
    });

    test('노드 스타일이 올바르게 적용되어야 합니다', () => {
      const styledNode = {
        ...mockNode,
        style: { fontSize: 24, textColor: '#000000', fontWeight: 'bold', fontStyle: 'italic' }
      };

      render(<Node node={styledNode} position={styledNode.position} />);

      const textElement = screen.getByText('Test Node');
      expect(textElement.style.fontSize).toBe('24px');
      expect(textElement.style.fontWeight).toBe('bold');
      expect(textElement.style.fontStyle).toBe('italic');
      expect(textElement.style.color).toBe('rgb(0, 0, 0)');
    });

    test('스타일이 없으면 기본값이 사용되어야 합니다', () => {
      const nodeWithoutStyle = { ...mockNode };
      delete nodeWithoutStyle.style;

      render(<Node node={nodeWithoutStyle} position={nodeWithoutStyle.position} />);

      const textElement = screen.getByText('Test Node');
      expect(textElement.style.fontSize).toBe('16px');
      expect(textElement.style.color).toBe('rgb(255, 255, 255)');
    });

    test('노드 박스 크기가 텍스트에 맞게 조절되어야 합니다', () => {
      const longTextNode = { ...mockNode, text: 'This is a very long text for testing auto resize' };

      render(<Node node={longTextNode} position={longTextNode.position} />);

      const nodeElement = screen.getByTestId('node-container');
      const width = parseInt(nodeElement.style.width);
      expect(width).toBeGreaterThan(120);
    });
  });
});
