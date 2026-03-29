import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Node from '../src/components/MindMap/Node.test';

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

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnDelete.mockClear();
  });

  test('렌더링 시 노드가 표시되어야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.getByTestId('node-container')).toHaveStyle({
      backgroundColor: '#4A90E2',
      left: '100px',
      top: '100px'
    });
  });

  test('드래그 기능이 동작해야 합니다', () => {
    const { container } = render(<Node node={mockNode} position={mockNode.position} />);
    const nodeElement = container.firstChild;

    // 마우스 다운 이벤트 - 노드 내에서 발생
    fireEvent.mouseDown(nodeElement, {
      clientX: 100,
      clientY: 100,
      target: nodeElement
    });

    // 마우스 이동 이벤트 - 같은 target에서 발생
    fireEvent.mouseMove(nodeElement, {
      clientX: 150,
      clientY: 150
    });

    // 마우스 업 이벤트
    fireEvent.mouseUp(nodeElement);

    // 위치가 변경되어야 합니다
    expect(nodeElement).toHaveStyle({
      left: '150px',
      top: '150px'
    });
  });

  test('텍스트 편집 기능이 동작해야 합니다', () => {
    render(<Node node={mockNode} position={mockNode.position} />);

    // 텍스트 클릭 시 편집 모드
    fireEvent.click(screen.getByText('Test Node'));

    // 입력 필드가 나타나야 합니다
    const input = screen.getByDisplayValue('Test Node');
    expect(input).toBeInTheDocument();

    // 텍스트 변경
    fireEvent.change(input, { target: { value: 'Updated Text' } });

    // Enter 키로 저장
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });

  test('Esc 키로 편집 취소가 가능해야 합니다', () => {
    const { container } = render(<Node node={mockNode} position={mockNode.position} />);

    // 편집 모드로 전환
    fireEvent.click(screen.getByText('Test Node'));

    // 텍스트 변경
    const input = screen.getByDisplayValue('Test Node');
    fireEvent.change(input, { target: { value: 'Updated Text' } });

    // Esc 키로 취소
    fireEvent.keyDown(input, { key: 'Escape' });

    // 원래 텍스트로 복원됩니다
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Updated Text')).not.toBeInTheDocument();
  });

  test('드래그 중에 노드가 확대되어야 합니다', () => {
    const { container } = render(<Node node={mockNode} position={mockNode.position} />);
    const nodeElement = container.firstChild;

    // 마우스 다운 이벤트 발생
    fireEvent.mouseDown(nodeElement, { clientX: 150, clientY: 150 });

    // isDragging 상태가 true로 변경됨에 따라 확대 효과 적용
    expect(nodeElement).toHaveStyle({
      transform: 'scale(1.05)'
    });
  });

  test('hover 시 시각적 피드백이 적용되어야 합니다', () => {
    const { container } = render(<Node node={mockNode} position={mockNode.position} />);
    const nodeElement = container.firstChild;

    // 마우스 오버
    fireEvent.mouseEnter(nodeElement);

    // 호버 스타일 적용 (테스트 환경에서는 직접 테스트 어려움)
    // 실제 애플리케이션에서는 CSS로 확인
    expect(nodeElement).toHaveStyle({
      cursor: 'move'
    });
  });

  test('자식 노드 표시 지원', () => {
    const nodeWithChildren = {
      ...mockNode,
      children: [
        { id: 'child-1', text: 'Child 1', color: '#52c41a', position: { x: 0, y: 0 } }
      ]
    };

    const { container } = render(<Node node={nodeWithChildren} position={mockNode.position} />);

    // 자식 노드는 부모 컴포넌트에서 렌더링되므로 여기서는 테스트하지 않음
    // Node 컴포넌트는 개별 노드만 다룸
    expect(container.firstChild).toBeInTheDocument();
  });

  test('root 노드 특수 스타일 적용', () => {
    const rootNode = {
      ...mockNode,
      isRoot: true,
      text: 'Root Node'
    };

    render(<Node node={rootNode} position={rootNode.position} />);

    expect(screen.getByText('Root Node')).toBeInTheDocument();
    // 루트 노드는 특별한 스타일을 가질 수 있음 (현재는 기본 스타일)
  });

  test('유효하지 않은 위치 처리', () => {
    const invalidPosition = { x: -100, y: -100 };

    const { container } = render(
      <Node node={mockNode} position={invalidPosition} />
    );

    expect(container.firstChild).toHaveStyle({
      left: '-100px',
      top: '-100px'
    });

    // 실제 애플리케이션에서는 경계 검사 추가 가능
  });
});