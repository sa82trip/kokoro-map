import React from 'react';

const DeleteConfirmDialog = ({ onConfirm, onCancel, childCount = 0 }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="노드 삭제 확인"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: '24px 32px',
          minWidth: 320,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#333' }}>노드 삭제</h3>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
          이 노드를 정말 삭제하시겠습니까?
        </p>
        {childCount > 0 && (
          <p style={{ margin: '0 0 16px 0', color: '#e74c3c', fontSize: 13 }}>
            하위 노드 {childCount}개도 함께 삭제됩니다.
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              color: '#333'
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 6,
              backgroundColor: '#e74c3c',
              cursor: 'pointer',
              fontSize: 14,
              color: '#fff',
              fontWeight: 500
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
