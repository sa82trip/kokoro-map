import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FolderTree from './FolderTree';
import useFileManagerStore from '../../store/FileManagerStore';

// StorageManager mock
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

// 자식 컴포넌트 mock
jest.mock('./FolderCreateDialog', () => {
  return function MockFolderCreateDialog({ mode, initialName, onConfirm, onCancel }) {
    return (
      <div data-testid="folder-create-dialog">
        <span>{mode === 'create' ? '새 폴더' : '폴더 이름 변경'}</span>
        <span>{initialName}</span>
        <button data-testid="dialog-confirm" onClick={() => onConfirm('테스트 폴더')} />
        <button data-testid="dialog-cancel" onClick={onCancel} />
      </div>
    );
  };
});

jest.mock('./FolderContextMenu', () => {
  return function MockFolderContextMenu({ folderId, onRename, onCreateSubfolder, onDelete, onClose }) {
    return (
      <div data-testid="folder-context-menu">
        <button data-testid="context-rename" onClick={() => onRename(folderId)} />
        <button data-testid="context-create-subfolder" onClick={() => onCreateSubfolder && onCreateSubfolder(folderId)} />
        <button data-testid="context-delete" onClick={() => onDelete(folderId)} />
        <button data-testid="context-close" onClick={onClose} />
      </div>
    );
  };
});

describe('FolderTree', () => {
  const mockFolders = [
    { id: 'f1', name: '폴더 1', parentId: null, createdAt: '2026-01-01T00:00:00Z', order: 0 },
    { id: 'f2', name: '폴더 2', parentId: null, createdAt: '2026-01-01T00:00:00Z', order: 1 },
    { id: 'f3', name: '하위 폴더', parentId: 'f1', createdAt: '2026-01-01T00:00:00Z', order: 0 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      documents: [],
      activeDocumentId: null,
      initialized: true,
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'recent',
      searchInContent: false,
      folders: [...mockFolders],
      activeFolderId: null
    });
  });

  test('"전체 문서" 항목을 렌더링한다', () => {
    render(<FolderTree />);
    expect(screen.getByTestId('folder-item-all')).toBeInTheDocument();
    expect(screen.getByText('전체 문서')).toBeInTheDocument();
  });

  test('루트 폴더를 렌더링한다', () => {
    render(<FolderTree />);
    expect(screen.getByText('폴더 1')).toBeInTheDocument();
    expect(screen.getByText('폴더 2')).toBeInTheDocument();
  });

  test('폴더 클릭 시 setActiveFolderId가 호출된다', () => {
    render(<FolderTree />);
    fireEvent.click(screen.getByTestId('folder-item-f1'));
    expect(useFileManagerStore.getState().activeFolderId).toBe('f1');
  });

  test('"전체 문서" 클릭 시 activeFolderId가 null이 된다', () => {
    useFileManagerStore.setState({ activeFolderId: 'f1' });
    render(<FolderTree />);
    fireEvent.click(screen.getByTestId('folder-item-all'));
    expect(useFileManagerStore.getState().activeFolderId).toBeNull();
  });

  test('활성 폴더에 active 클래스가 적용된다', () => {
    useFileManagerStore.setState({ activeFolderId: 'f1' });
    render(<FolderTree />);
    expect(screen.getByTestId('folder-item-f1')).toHaveClass('active');
  });

  test('"+" 버튼 클릭 시 생성 다이얼로그가 열린다', () => {
    render(<FolderTree />);
    expect(screen.queryByTestId('folder-create-dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-folder-btn'));
    expect(screen.getByTestId('folder-create-dialog')).toBeInTheDocument();
    expect(screen.getByText('새 폴더')).toBeInTheDocument();
  });

  test('다이얼로그에서 확인 시 createFolder가 호출된다', () => {
    render(<FolderTree />);
    fireEvent.click(screen.getByTestId('new-folder-btn'));
    fireEvent.click(screen.getByTestId('dialog-confirm'));
    expect(useFileManagerStore.getState().folders).toHaveLength(4);
  });

  test('다이얼로그에서 취소 시 닫힌다', () => {
    render(<FolderTree />);
    fireEvent.click(screen.getByTestId('new-folder-btn'));
    fireEvent.click(screen.getByTestId('dialog-cancel'));
    expect(screen.queryByTestId('folder-create-dialog')).not.toBeInTheDocument();
  });

  test('하위 폴더는 펼치기 전까지 보이지 않는다', () => {
    render(<FolderTree />);
    expect(screen.queryByText('하위 폴더')).not.toBeInTheDocument();
  });

  test('chevron 클릭 시 하위 폴더가 펼쳐진다', () => {
    render(<FolderTree />);
    fireEvent.click(screen.getByTestId('chevron-f1'));
    expect(screen.getByText('하위 폴더')).toBeInTheDocument();
  });

  test('우클릭 시 컨텍스트 메뉴가 표시된다', () => {
    render(<FolderTree />);
    fireEvent.contextMenu(screen.getByTestId('folder-item-f1'), {
      clientX: 100,
      clientY: 200
    });
    expect(screen.getByTestId('folder-context-menu')).toBeInTheDocument();
  });

  test('컨텍스트 메뉴에서 이름 변경 클릭 시 다이얼로그가 열린다', () => {
    render(<FolderTree />);
    fireEvent.contextMenu(screen.getByTestId('folder-item-f1'), {
      clientX: 100,
      clientY: 200
    });
    fireEvent.click(screen.getByTestId('context-rename'));
    expect(screen.getByTestId('folder-create-dialog')).toBeInTheDocument();
    expect(screen.getByText('폴더 이름 변경')).toBeInTheDocument();
  });

  test('컨텍스트 메뉴에서 삭제 클릭 시 deleteFolder가 호출된다', () => {
    render(<FolderTree />);
    fireEvent.contextMenu(screen.getByTestId('folder-item-f1'), {
      clientX: 100,
      clientY: 200
    });
    fireEvent.click(screen.getByTestId('context-delete'));
    expect(useFileManagerStore.getState().folders).toHaveLength(1);
  });

  test('컨텍스트 메뉴에서 하위 폴더 만들기 클릭 시 생성 다이얼로그가 열린다', () => {
    render(<FolderTree />);
    fireEvent.contextMenu(screen.getByTestId('folder-item-f1'), {
      clientX: 100,
      clientY: 200
    });
    fireEvent.click(screen.getByTestId('context-create-subfolder'));
    expect(screen.getByTestId('folder-create-dialog')).toBeInTheDocument();
    expect(screen.getByText('새 폴더')).toBeInTheDocument();
  });

  test('하위 폴더 다이얼로그에서 확인 시 parentId와 함께 createFolder가 호출된다', () => {
    render(<FolderTree />);
    fireEvent.contextMenu(screen.getByTestId('folder-item-f1'), {
      clientX: 100,
      clientY: 200
    });
    fireEvent.click(screen.getByTestId('context-create-subfolder'));
    fireEvent.click(screen.getByTestId('dialog-confirm'));
    const folders = useFileManagerStore.getState().folders;
    const newFolder = folders.find(f => f.name === '테스트 폴더' && f.parentId === 'f1');
    expect(newFolder).toBeDefined();
  });
});
