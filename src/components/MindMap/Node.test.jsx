import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Node from './Node';
import useMindMapStore from '../../store/MindMapStore';

jest.mock('../../store/MindMapStore');
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
});
