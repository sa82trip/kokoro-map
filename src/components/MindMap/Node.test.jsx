import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Node from './Node';
import useMindMapStore from '../../store/MindMapStore';

jest.mock('../../store/MindMapStore');
jest.mock('./DeleteConfirmDialog', () => {
  return function MockDialog({ onConfirm, onCancel, childCount }) {
    return (
      <div data-testid="delete-dialog">
        <span data-testid="child-count">{childCount}</span>
        <button data-testid="dialog-confirm" onClick={onConfirm}>삭제</button>
        <button data-testid="dialog-cancel" onClick={onCancel}>취소</button>
      </div>
    );
  };
});
const mockUseMindMapStore = useMindMapStore;

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('Node Component', () => {
  const mockNode = {
    id: 'node-1',
    text: 'Test Node',
    color: '#4A90E2',
    position: { x: 100, y: 100 },
    children: [],
    isRoot: false
  };

  const mockUpdateNodeText = jest.fn();
  const mockUpdateNodePosition = jest.fn();

  beforeEach(() => {
    mockUseMindMapStore.mockReturnValue({
      updateNodeText: mockUpdateNodeText,
      updateNodePosition: mockUpdateNodePosition
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 기존 테스트
  test('텍스트와 함께 노드를 렌더링한다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  test('텍스트 클릭 시 편집 모드로 전환한다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    fireEvent.click(screen.getByText('Test Node'));
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
  });

  test('입력 변경 시 텍스트를 업데이트한다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    fireEvent.click(screen.getByText('Test Node'));
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });
    expect(mockUpdateNodeText).toHaveBeenCalledWith('node-1', 'Updated Text');
  });

  test('자식 추가 버튼이 렌더링된다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  test('추가 버튼 클릭 시 onAddChild를 호출한다', () => {
    const mockOnAddChild = jest.fn();
    render(<Node node={mockNode} position={mockNode.position} onAddChild={mockOnAddChild} />);
    fireEvent.click(screen.getByText('+'));
    expect(mockOnAddChild).toHaveBeenCalled();
  });

  // === 드래그 개선 테스트 ===
  describe('드래그 동작', () => {
    test('마우스가 노드 밖으로 나가도 드래그가 계속된다', () => {
      render(<Node node={mockNode} position={mockNode.position} />);

      const nodeElement = screen.getByTestId('node-container');

      // 노드에서 마우스 다운 (offset: clientX - position.x = 200 - 100 = 100)
      fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

      // document 레벨에서 마우스 이동 (노드 밖)
      // 새 위치 = clientX - offset = clientX - 100
      fireEvent.mouseMove(document, { clientX: 300, clientY: 250 });
      fireEvent.mouseMove(document, { clientX: 400, clientY: 350 });

      expect(mockUpdateNodePosition).toHaveBeenCalledWith('node-1', { x: 200, y: 200 });
      expect(mockUpdateNodePosition).toHaveBeenCalledWith('node-1', { x: 300, y: 300 });
    });

    test('document 레벨에서 mouseup으로 드래그가 종료된다', () => {
      render(<Node node={mockNode} position={mockNode.position} />);

      const nodeElement = screen.getByTestId('node-container');
      fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

      // document에서 mouseup
      fireEvent.mouseUp(document);

      // 이후 마우스 이동은 위치 업데이트하지 않음
      mockUpdateNodePosition.mockClear();
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
      expect(mockUpdateNodePosition).not.toHaveBeenCalled();
    });

    test('드래그 중 transition이 비활성화된다', () => {
      render(<Node node={mockNode} position={mockNode.position} />);

      const nodeElement = screen.getByTestId('node-container');
      fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

      // 드래그 중에는 transition이 none이어야 함
      expect(nodeElement.style.transition).toBe('none');
    });
  });

  // === 삭제 버튼 테스트 ===
  describe('삭제 기능', () => {
    test('루트 노드가 아니면 삭제 버튼이 렌더링된다', () => {
      render(<Node node={mockNode} position={mockNode.position} />);
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    test('루트 노드는 삭제 버튼이 없다', () => {
      const rootNode = { ...mockNode, isRoot: true };
      render(<Node node={rootNode} position={rootNode.position} />);
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });

    test('삭제 버튼 클릭 시 확인 다이얼로그가 나타난다', () => {
      render(<Node node={mockNode} position={mockNode.position} />);

      fireEvent.click(screen.getByTestId('delete-button'));
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    test('다이얼로그에서 삭제 확인 시 onDelete가 호출된다', () => {
      const mockOnDelete = jest.fn();
      render(<Node node={mockNode} position={mockNode.position} onDelete={mockOnDelete} />);

      fireEvent.click(screen.getByTestId('delete-button'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      expect(mockOnDelete).toHaveBeenCalledWith('node-1');
    });

    test('다이얼로그에서 취소 시 onDelete가 호출되지 않는다', () => {
      const mockOnDelete = jest.fn();
      render(<Node node={mockNode} position={mockNode.position} onDelete={mockOnDelete} />);

      fireEvent.click(screen.getByTestId('delete-button'));
      fireEvent.click(screen.getByTestId('dialog-cancel'));

      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    test('자식 노드가 있으면 하위 노드 수가 다이얼로그에 전달된다', () => {
      const nodeWithChildren = {
        ...mockNode,
        children: [
          { id: 'c1', text: '자식1', children: [], isRoot: false },
          { id: 'c2', text: '자식2', children: [
            { id: 'gc1', text: '손자1', children: [], isRoot: false }
          ], isRoot: false }
        ]
      };

      render(<Node node={nodeWithChildren} position={nodeWithChildren.position} />);

      fireEvent.click(screen.getByTestId('delete-button'));
      // 자식 2 + 손자 1 = 3
      expect(screen.getByTestId('child-count')).toHaveTextContent('3');
    });
  });
});
