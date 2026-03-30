import React, { useState, useCallback } from 'react';
import useFileManagerStore from '../../store/FileManagerStore';
import FolderCreateDialog from './FolderCreateDialog';
import FolderContextMenu from './FolderContextMenu';
import './FolderTree.css';

const FolderTree = () => {
  const folders = useFileManagerStore((state) => state.folders);
  const activeFolderId = useFileManagerStore((state) => state.activeFolderId);
  const setActiveFolderId = useFileManagerStore((state) => state.setActiveFolderId);
  const createFolder = useFileManagerStore((state) => state.createFolder);
  const renameFolder = useFileManagerStore((state) => state.renameFolder);
  const deleteFolder = useFileManagerStore((state) => state.deleteFolder);

  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [dialogState, setDialogState] = useState(null);

  // 폴더 확장/접힘 토글
  const toggleExpand = useCallback((e, folderId) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // 폴더 아이템 렌더링 (재귀)
  const renderFolderItems = (parentId, depth) => {
    const children = folders
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return children.map(folder => {
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isActive = activeFolderId === folder.id;

      return (
        <li key={folder.id}>
          <div
            className={`folder-tree-item ${isActive ? 'active' : ''}`}
            style={{ paddingLeft: `${20 + depth * 20}px` }}
            onClick={() => setActiveFolderId(folder.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ folderId: folder.id, x: e.clientX, y: e.clientY });
            }}
            data-testid={`folder-item-${folder.id}`}
          >
            {hasChildren ? (
              <span
                className={`folder-tree-chevron ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => toggleExpand(e, folder.id)}
                data-testid={`chevron-${folder.id}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            ) : (
              <span className="folder-tree-chevron-spacer" />
            )}
            <span className="folder-tree-icon">
              {isExpanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <path d="M2 10h20" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </span>
            <span className="folder-tree-item-name">{folder.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <ul className="folder-tree-list">
              {renderFolderItems(folder.id, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  // 루트 폴더 생성 다이얼로그 열기
  const handleOpenCreateDialog = () => {
    setDialogState({ mode: 'create', parentFolderId: null, initialName: '' });
  };

  // 다이얼로그 확인
  const handleDialogConfirm = (name) => {
    if (dialogState.mode === 'create') {
      createFolder(name, dialogState.parentFolderId);
    } else if (dialogState.mode === 'rename') {
      renameFolder(dialogState.folderId, name);
    }
    setDialogState(null);
  };

  // 컨텍스트 메뉴 — 이름 변경
  const handleRename = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    setContextMenu(null);
    setDialogState({ mode: 'rename', folderId, initialName: folder ? folder.name : '' });
  };

  // 컨텍스트 메뉴 — 하위 폴더 만들기
  const handleCreateSubfolder = (folderId) => {
    setContextMenu(null);
    setDialogState({ mode: 'create', parentFolderId: folderId, initialName: '' });
  };

  // 컨텍스트 메뉴 — 삭제
  const handleDelete = (folderId) => {
    deleteFolder(folderId);
    setContextMenu(null);
  };

  return (
    <aside className="folder-tree">
      <div className="folder-tree-header">
        <h3>폴더</h3>
        <button
          className="folder-tree-new-btn"
          onClick={handleOpenCreateDialog}
          data-testid="new-folder-btn"
          aria-label="새 폴더"
        >
          +
        </button>
      </div>
      <ul className="folder-tree-list">
        <li>
          <div
            className={`folder-tree-item ${activeFolderId === null ? 'active' : ''}`}
            onClick={() => setActiveFolderId(null)}
            data-testid="folder-item-all"
          >
            <span className="folder-tree-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="folder-tree-item-name">전체 문서</span>
          </div>
        </li>
        {renderFolderItems(null, 0)}
      </ul>
      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folderId={contextMenu.folderId}
          onRename={handleRename}
          onCreateSubfolder={handleCreateSubfolder}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
      {dialogState && (
        <FolderCreateDialog
          mode={dialogState.mode}
          initialName={dialogState.initialName}
          onConfirm={handleDialogConfirm}
          onCancel={() => setDialogState(null)}
        />
      )}
    </aside>
  );
};

export default FolderTree;
