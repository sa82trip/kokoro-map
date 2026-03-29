import React, { useState, useRef, useEffect, useCallback } from 'react';
import useMindMapStore from '../../store/MindMapStore';
import { createChildNode } from '../../types/NodeTypes';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const Node = ({ node, position: initialPosition, onAddChild, onDelete, isSelected }) => {
  const { updateNodeText, updateNodePosition } = useMindMapStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text || 'New Node');
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef(null);

  // 편집 모드에서 자동 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // document 레벨 마우스 이벤트로 드래그 자연스럽게
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newPosition = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y
      };
      setPosition(newPosition);
      updateNodePosition(node.id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, node.id, updateNodePosition]);

  // 텍스트 변경 시 스토어 업데이트
  const handleTextChange = (e) => {
    setText(e.target.value);
    updateNodeText(node.id, e.target.value);
  };

  // 텍스트 편집 핸들러
  const handleTextSubmit = () => {
    setIsEditing(false);
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  // 자식 노드 추가 핸들러
  const handleAddChild = (e) => {
    e.stopPropagation();
    const childNode = createChildNode(node.id, '새 노드', node.color);

    const childPosition = {
      x: position.x + 250,
      y: position.y
    };

    childNode.position = childPosition;

    if (onAddChild) {
      onAddChild(node.id, childNode);
    }
  };

  // 자식 노드 수 계산 (재귀)
  const countDescendants = (n) => {
    if (!n.children || n.children.length === 0) return 0;
    return n.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
  };

  // 삭제 버튼 클릭
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (node.isRoot) return;
    setShowDeleteConfirm(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    if (onDelete) {
      onDelete(node.id);
    }
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // 노드 기본 스타일
  const nodeStyle = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: 200,
    height: 80,
    backgroundColor: node.color || '#4A90E2',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isEditing ? 'text' : 'move',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: isDragging ? 'none' : 'all 0.3s ease',
    userSelect: 'none',
    border: isSelected ? '3px solid #1890ff' : 'none',
    ...(isDragging && {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      zIndex: 1000
    })
  };

  // 추가 버튼 스타일
  const addButtonStyle = {
    position: 'absolute',
    right: -12,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 24,
    height: 24,
    backgroundColor: '#52c41a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease',
    fontSize: '16px',
    color: 'white',
    fontWeight: 'bold',
    lineHeight: 1,
    border: '2px solid white'
  };

  return (
    <div
      data-testid="node-container"
      style={nodeStyle}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSubmit();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setText(node.text);
            }
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center',
            outline: 'none',
            width: '90%'
          }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          style={{
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          {text}
        </div>
      )}

      <div
        style={addButtonStyle}
        onClick={handleAddChild}
        onMouseDown={(e) => e.stopPropagation()}
        title="자식 노드 추가"
      >
        +
      </div>

      {!node.isRoot && (
        <div
          data-testid="delete-button"
          style={{
            position: 'absolute',
            left: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            backgroundColor: '#e74c3c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
            fontSize: '16px',
            color: 'white',
            fontWeight: 'bold',
            lineHeight: 1,
            border: '2px solid white'
          }}
          onClick={handleDeleteClick}
          onMouseDown={(e) => e.stopPropagation()}
          title="노드 삭제"
        >
          ×
        </div>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          childCount={countDescendants(node)}
        />
      )}
    </div>
  );
};

export default Node;
