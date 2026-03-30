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
        { id: 'f1', name: '폴더 1', parentId: null },
        { id: 'f2', name: '폴더 2', parentId: null }
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
});
