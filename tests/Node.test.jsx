import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Node from '../src/components/MindMap/Node';
import useMindMapStore from '../src/store/MindMapStore';

// Zustand store 모킹
jest.mock('../src/store/MindMapStore');
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

  beforeEach(() => {
    mockUseMindMapStore.mockReturnValue({
      updateNodeText: mockUpdateNodeText,
      updateNodePosition: mockUpdateNodePosition
    });
    mockUpdateNodeText.mockClear();
    mockUpdateNodePosition.mockClear();
  });

  afterEach(() => {
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

  test('텍스트 클릭 시 편집 모드로 전환되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    fireEvent.click(screen.getByText('Test Node'));
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
  });

  test('텍스트 변경 시 스토어 업데이트가 호출되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    fireEvent.click(screen.getByText('Test Node'));
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });

    expect(mockUpdateNodeText).toHaveBeenCalledWith('test-node', 'Updated Text');
  });

  test('Enter 키로 편집이 완료되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    fireEvent.click(screen.getByText('Test Node'));
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.keyDown(input, { key: 'Enter' });

    // 편집 모드 종료 → 텍스트 표시 모드
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Node')).not.toBeInTheDocument();
  });

  test('Esc 키로 편집 취소가 가능해야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    // 편집 모드로 전환
    fireEvent.click(screen.getByText('Test Node'));

    // 텍스트 변경
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });

    // Esc 키로 취소
    fireEvent.keyDown(input, { key: 'Escape' });

    // 원래 텍스트로 복원
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  test('드래그 시 document 레벨에서 위치가 업데이트되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');

    // 노드에서 마우스 다운
    fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

    // document 레벨에서 마우스 이동 (노드 밖으로)
    fireEvent.mouseMove(document, { clientX: 300, clientY: 250 });

    expect(mockUpdateNodePosition).toHaveBeenCalledWith('test-node', { x: 200, y: 200 });
  });

  test('document 레벨 mouseup으로 드래그가 종료되어야 합니다', () => {
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

  test('드래그 중 transition이 비활성화되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    const nodeElement = screen.getByTestId('node-container');
    fireEvent.mouseDown(nodeElement, { clientX: 200, clientY: 150 });

    expect(nodeElement.style.transition).toBe('none');
  });

  test('input/textarea 클릭 시 드래그가 시작되지 않아야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    // 편집 모드로 전환
    fireEvent.click(screen.getByText('Test Node'));
    const input = screen.getByDisplayValue('Test Node');

    // input에서 마우스 다운 → 드래그 시작 안 함
    fireEvent.mouseDown(input);
    fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });

    // updateNodePosition이 호출되지 않아야 함 (드래그가 시작되지 않았으므로)
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
    const rootNode = {
      ...mockNode,
      isRoot: true,
      text: 'Root Node'
    };

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
    // inline style에서 border가 설정되지 않으면 빈 문자열
    expect(nodeElement.style.border).toBe('');
  });
});
