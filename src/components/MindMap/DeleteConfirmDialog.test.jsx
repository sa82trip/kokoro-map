import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmDialog from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('다이얼로그가 렌더링되면 삭제 확인 메시지가 보인다', () => {
    render(<DeleteConfirmDialog onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    expect(screen.getByText('노드 삭제')).toBeInTheDocument();
    expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument();
  });

  test('자식 노드가 있으면 함께 삭제된다는 안내가 보인다', () => {
    render(
      <DeleteConfirmDialog
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        childCount={3}
      />
    );

    expect(screen.getByText(/하위 노드 3개도 함께 삭제됩니다/)).toBeInTheDocument();
  });

  test('자식 노드가 없으면 하위 노드 안내가 보이지 않는다', () => {
    render(
      <DeleteConfirmDialog
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        childCount={0}
      />
    );

    expect(screen.queryByText(/하위 노드/)).not.toBeInTheDocument();
  });

  test('삭제 버튼 클릭 시 onConfirm이 호출된다', () => {
    render(<DeleteConfirmDialog onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('삭제'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('취소 버튼 클릭 시 onCancel이 호출된다', () => {
    render(<DeleteConfirmDialog onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('취소'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('Escape 키를 누르면 취소된다', () => {
    render(<DeleteConfirmDialog onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    fireEvent.keyDown(screen.getByText('노드 삭제').closest('[role="dialog"]'), {
      key: 'Escape'
    });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
