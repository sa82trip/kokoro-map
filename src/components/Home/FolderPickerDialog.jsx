import React from 'react';
import { createPortal } from 'react-dom';
import useFileManagerStore from '../../store/FileManagerStore';
import { getFolderDepth } from '../../types/FolderTypes';
import './FolderPickerDialog.css';

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const FolderPickerDialog = ({ docId, currentFolderId, onSelect, onCancel }) => {
  const folders = useFileManagerStore((state) => state.folders);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // 트리 순서로 정렬: 부모 바로 아래 자식이 오도록 DFS
  const sortedFolders = (() => {
    const childrenOf = (parentId) =>
      folders.filter(f => f.parentId === parentId).sort((a, b) => a.order - b.order);
    const result = [];
    const walk = (parentId) => {
      for (const child of childrenOf(parentId)) {
        result.push(child);
        walk(child.id);
      }
    };
    walk(null);
    return result;
  })();

  const dialog = (
    <div className="folder-picker-overlay" onClick={handleOverlayClick}>
      <div className="folder-picker">
        <h3>문서 이동</h3>
        <ul className="folder-picker-list">
          <li
            className={`folder-picker-item ${currentFolderId === null ? 'current' : ''}`}
            onClick={() => onSelect(docId, null)}
            data-testid="picker-root"
          >
            <span className="folder-picker-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span>루트 (폴더 없음)</span>
            {currentFolderId === null && <span className="folder-picker-current">현재 위치</span>}
          </li>
          {sortedFolders.map(folder => {
            const depth = getFolderDepth(folder.id, folders);
            return (
              <li
                key={folder.id}
                className={`folder-picker-item ${currentFolderId === folder.id ? 'current' : ''}`}
                onClick={() => onSelect(docId, folder.id)}
                data-testid={`picker-${folder.id}`}
                style={{ paddingLeft: `${12 + depth * 20}px` }}
              >
                <span className="folder-picker-icon">
                  <FolderIcon />
                </span>
                <span>{folder.name}</span>
                {currentFolderId === folder.id && <span className="folder-picker-current">현재 위치</span>}
              </li>
            );
          })}
        </ul>
        <div className="folder-picker-buttons">
          <button className="folder-picker-cancel" onClick={onCancel} data-testid="picker-cancel">
            취소
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};

export default FolderPickerDialog;
