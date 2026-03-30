import React, { useState } from 'react';
import './DocumentCard.css';

const DocumentCard = ({ document, onClick, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    onDelete(document.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="document-card" onClick={() => onClick(document.id)}>
      <div className="document-card-thumbnail">
        {document.thumbnail ? (
          <img src={document.thumbnail} alt={document.title} />
        ) : (
          <div className="document-card-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="9" />
              <line x1="12" y1="15" x2="12" y2="21" />
              <line x1="3" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="21" y2="12" />
              <line x1="5.6" y1="5.6" x2="8.5" y2="8.5" />
              <line x1="15.5" y1="15.5" x2="18.4" y2="18.4" />
              <line x1="5.6" y1="18.4" x2="8.5" y2="15.5" />
              <line x1="15.5" y1="8.5" x2="18.4" y2="5.6" />
            </svg>
          </div>
        )}
      </div>

      <div className="document-card-info">
        <h3 className="document-card-title">{document.title}</h3>
        <div className="document-card-meta">
          <span className="document-card-date">{formatDate(document.updatedAt)}</span>
          <span className="document-card-nodes">{document.nodeCount}개 노드</span>
        </div>
      </div>

      <button
        className="document-card-delete"
        onClick={handleDeleteClick}
        aria-label="문서 삭제"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {showDeleteConfirm && (
        <div className="document-card-confirm" onClick={(e) => e.stopPropagation()}>
          <p>이 문서를 삭제하시겠습니까?</p>
          <div className="document-card-confirm-buttons">
            <button className="confirm-cancel" onClick={handleCancelDelete}>취소</button>
            <button className="confirm-delete" onClick={handleConfirmDelete}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
