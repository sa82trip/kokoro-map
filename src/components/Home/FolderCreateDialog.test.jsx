import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FolderCreateDialog from './FolderCreateDialog';

describe('FolderCreateDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create 모드에서 "새 폴더" 제목을 표시한다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByText('새 폴더')).toBeInTheDocument();
  });

  test('rename 모드에서 "폴더 이름 변경" 제목을 표시한다', () => {
    render(<FolderCreateDialog mode="rename" initialName="기존 이름" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByText('폴더 이름 변경')).toBeInTheDocument();
  });

  test('rename 모드에서 initialName이 입력창에 표시된다', () => {
    render(<FolderCreateDialog mode="rename" initialName="기존 이름" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('folder-name-input').value).toBe('기존 이름');
  });

  test('확인 버튼 클릭 시 onConfirm이 호출된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const input = screen.getByTestId('folder-name-input');
    fireEvent.change(input, { target: { value: '새 폴더명' } });
    fireEvent.click(screen.getByTestId('folder-confirm-btn'));
    expect(mockOnConfirm).toHaveBeenCalledWith('새 폴더명');
  });

  test('취소 버튼 클릭 시 onCancel이 호출된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTestId('folder-cancel-btn'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('ESC 키 입력 시 onCancel이 호출된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.keyDown(screen.getByTestId('folder-name-input'), { key: 'Escape' });
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('Enter 키 입력 시 onConfirm이 호출된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    const input = screen.getByTestId('folder-name-input');
    fireEvent.change(input, { target: { value: '폴더' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnConfirm).toHaveBeenCalledWith('폴더');
  });

  test('빈 이름이면 확인 버튼이 비활성화된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('folder-confirm-btn')).toBeDisabled();
  });

  test('오버레이 클릭 시 onCancel이 호출된다', () => {
    render(<FolderCreateDialog mode="create" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('새 폴더').closest('.folder-dialog-overlay'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
