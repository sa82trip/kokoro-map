import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FolderContextMenu from './FolderContextMenu';

describe('FolderContextMenu', () => {
  const mockOnRename = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCreateSubfolder = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('모든 메뉴 아이템을 표시한다', () => {
    render(
      <FolderContextMenu
        x={100} y={200}
        folderId="f-1"
        onRename={mockOnRename}
        onCreateSubfolder={mockOnCreateSubfolder}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByTestId('context-create-subfolder')).toBeInTheDocument();
    expect(screen.getByTestId('context-rename')).toBeInTheDocument();
    expect(screen.getByTestId('context-delete')).toBeInTheDocument();
    expect(screen.getByText('하위 폴더 만들기')).toBeInTheDocument();
    expect(screen.getByText('이름 변경')).toBeInTheDocument();
    expect(screen.getByText('삭제')).toBeInTheDocument();
  });

  test('이름 변경 클릭 시 onRename이 호출된다', () => {
    render(
      <FolderContextMenu
        x={100} y={200}
        folderId="f-1"
        onRename={mockOnRename}
        onCreateSubfolder={mockOnCreateSubfolder}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByTestId('context-rename'));
    expect(mockOnRename).toHaveBeenCalledWith('f-1');
  });

  test('삭제 클릭 시 onDelete가 호출된다', () => {
    render(
      <FolderContextMenu
        x={100} y={200}
        folderId="f-1"
        onRename={mockOnRename}
        onCreateSubfolder={mockOnCreateSubfolder}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByTestId('context-delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('f-1');
  });

  test('하위 폴더 만들기 클릭 시 onCreateSubfolder가 호출된다', () => {
    render(
      <FolderContextMenu
        x={100} y={200}
        folderId="f-1"
        onRename={mockOnRename}
        onCreateSubfolder={mockOnCreateSubfolder}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByTestId('context-create-subfolder'));
    expect(mockOnCreateSubfolder).toHaveBeenCalledWith('f-1');
  });

  test('지정된 위치에 렌더링된다', () => {
    render(
      <FolderContextMenu
        x={150} y={250}
        folderId="f-1"
        onRename={mockOnRename}
        onCreateSubfolder={mockOnCreateSubfolder}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
      />
    );
    const menu = screen.getByTestId('context-rename').closest('.folder-context-menu');
    expect(menu.style.left).toBe('150px');
    expect(menu.style.top).toBe('250px');
  });
});
