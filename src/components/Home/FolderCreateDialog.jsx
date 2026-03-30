import React, { useState, useEffect, useRef } from 'react';
import './FolderCreateDialog.css';

const FolderCreateDialog = ({ mode = 'create', initialName = '', onConfirm, onCancel }) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && name.trim()) {
      onConfirm(name.trim());
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  return (
    <div className="folder-dialog-overlay" onClick={handleOverlayClick}>
      <div className="folder-dialog">
        <h3>{mode === 'create' ? '새 폴더' : '폴더 이름 변경'}</h3>
        <input
          ref={inputRef}
          className="folder-dialog-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="폴더 이름"
          data-testid="folder-name-input"
        />
        <div className="folder-dialog-buttons">
          <button
            className="folder-dialog-cancel"
            onClick={onCancel}
            data-testid="folder-cancel-btn"
          >
            취소
          </button>
          <button
            className="folder-dialog-confirm"
            onClick={handleConfirm}
            disabled={!name.trim()}
            data-testid="folder-confirm-btn"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderCreateDialog;
