import React, { useEffect, useRef } from 'react';
import './FolderContextMenu.css';

const FolderContextMenu = ({ x, y, folderId, onRename, onCreateSubfolder, onDelete, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="folder-context-menu"
      style={{ left: x, top: y }}
    >
      <div
        className="folder-context-menu-item"
        onClick={() => onCreateSubfolder(folderId)}
        data-testid="context-create-subfolder"
      >
        하위 폴더 만들기
      </div>
      <div
        className="folder-context-menu-item"
        onClick={() => onRename(folderId)}
        data-testid="context-rename"
      >
        이름 변경
      </div>
      <div
        className="folder-context-menu-item danger"
        onClick={() => onDelete(folderId)}
        data-testid="context-delete"
      >
        삭제
      </div>
    </div>
  );
};

export default FolderContextMenu;
