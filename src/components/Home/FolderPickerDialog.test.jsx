import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FolderPickerDialog from './FolderPickerDialog';
import useFileManagerStore from '../../store/FileManagerStore';

jest.mock('../../utils/StorageManager', () => ({
  StorageManager: {
    loadIndex: jest.fn(),
    saveIndex: jest.fn(),
    loadDocument: jest.fn(),
    saveDocument: jest.fn(),
    deleteDocument: jest.fn(),
    loadLegacyData: jest.fn(),
    clearLegacyData: jest.fn(),
    hasLegacyData: jest.fn(),
    hasIndex: jest.fn(),
    loadFolders: jest.fn(),
    saveFolders: jest.fn(),
    hasFolders: jest.fn()
  }
}));

describe('FolderPickerDialog', () => {
  const mockOnSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      folders: [
        { id: 'f1', name: '폴더 1', parentId: null, order: 0 },
        { id: 'f2', name: '폴더 2', parentId: null, order: 1 },
        { id: 'f3', name: '하위 폴더', parentId: 'f1', order: 0 }
      ]
    });
  });

  test('"문서 이동" 제목을 표시한다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    expect(screen.getByText('문서 이동')).toBeInTheDocument();
  });

  test('루트 옵션과 폴더 목록을 표시한다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('picker-root')).toBeInTheDocument();
    expect(screen.getByText('폴더 1')).toBeInTheDocument();
    expect(screen.getByText('폴더 2')).toBeInTheDocument();
  });

  test('현재 폴더에 "현재 위치" 표시한다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId="f1" onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    const f1Item = screen.getByTestId('picker-f1');
    expect(f1Item).toHaveClass('current');
    expect(screen.getByText('현재 위치')).toBeInTheDocument();
  });

  test('폴더 클릭 시 onSelect가 호출된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTestId('picker-f1'));
    expect(mockOnSelect).toHaveBeenCalledWith('d1', 'f1');
  });

  test('루트 클릭 시 onSelect가 null과 함께 호출된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId="f1" onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTestId('picker-root'));
    expect(mockOnSelect).toHaveBeenCalledWith('d1', null);
  });

  test('취소 버튼 클릭 시 onCancel이 호출된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTestId('picker-cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('하위 폴더가 들여쓰기로 표시된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    const rootFolder = screen.getByTestId('picker-f1');
    const childFolder = screen.getByTestId('picker-f3');
    // 루트 폴더는 기본 패딩, 하위 폴더는 추가 들여쓰기
    expect(rootFolder.style.paddingLeft).toBe('12px');
    expect(childFolder.style.paddingLeft).toBe('32px');
  });

  test('하위 폴더가 부모 폴더 바로 아래에 렌더링된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    const list = screen.getByRole('list');
    const items = list.querySelectorAll('.folder-picker-item');
    // 순서: 루트, 폴더1, 하위폴더(f3), 폴더2
    expect(items[1]).toHaveAttribute('data-testid', 'picker-f1');
    expect(items[2]).toHaveAttribute('data-testid', 'picker-f3');
    expect(items[3]).toHaveAttribute('data-testid', 'picker-f2');
  });

  test('하위 폴더 클릭 시 정상적으로 onSelect가 호출된다', () => {
    render(<FolderPickerDialog docId="d1" currentFolderId={null} onSelect={mockOnSelect} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTestId('picker-f3'));
    expect(mockOnSelect).toHaveBeenCalledWith('d1', 'f3');
  });
});
