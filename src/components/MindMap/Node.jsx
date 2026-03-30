import React, { useState, useRef, useEffect, useCallback } from 'react';
import useMindMapStore from '../../store/MindMapStore';
import { createChildNode, DEFAULT_NODE_STYLE } from '../../types/NodeTypes';
import { calculateNewChildPosition } from '../../utils/LayoutEngine';
import { measureText } from '../../utils/TextMeasurer';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import NodeEditorToolbar from './NodeEditorToolbar';

const Node = ({ node, position: initialPosition, onAddChild, onDelete, isSelected, onSelect, showToolbar, onToggleToolbar }) => {
  const { updateNodeText, updateNodePosition, updateNodeStyle, saveNodePositions, zoomLevel } = useMindMapStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text || 'New Node');
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const saveTimerRef = useRef(null);

  const nodeStyle = node.style || { ...DEFAULT_NODE_STYLE };
  const { fontSize, textColor, fontWeight, fontStyle } = nodeStyle;

  // 노드 박스 자동 크기 계산
  const measured = measureText(text, fontSize, fontWeight, fontStyle);
  const nodeWidth = Math.max(120, measured.width);
  const nodeHeight = measured.height;

  // 편집 모드에서 자동 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // node.text 외부 변경 동기화
  useEffect(() => {
    setText(node.text || 'New Node');
  }, [node.text]);

  // 외부에서 position 변경 시 동기화 (자동정렬, 재조정 등)
  useEffect(() => {
    if (!isDragging) {
      setPosition(initialPosition || { x: 0, y: 0 });
    }
  }, [initialPosition?.x, initialPosition?.y]);

  // document 레벨 마우스 이벤트로 드래그
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const vp = useMindMapStore.getState().viewport || { x: 0, y: 0 };
      const newPosition = {
        x: e.clientX - dragOffsetRef.current.x - vp.x,
        y: e.clientY - dragOffsetRef.current.y - vp.y
      };
      if (isNaN(newPosition.x) || isNaN(newPosition.y)) return;
      setPosition(newPosition);
      updateNodePosition(node.id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      saveNodePositions();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, node.id, updateNodePosition, saveNodePositions]);

  // 디바운스 자동 저장 (300ms)
  const debouncedSave = useCallback((newText) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNodeText(node.id, newText);
    }, 300);
  }, [node.id, updateNodeText]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // 텍스트 변경 (디바운스 저장)
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    debouncedSave(newText);
  };

  // 편집 완료
  const handleTextSubmit = () => {
    setIsEditing(false);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    updateNodeText(node.id, text);
  };

  // 더블클릭으로 편집 모드 진입
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (isEditing) return;

    const vp = useMindMapStore.getState().viewport || { x: 0, y: 0 };
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x - vp.x,
      y: e.clientY - position.y - vp.y
    };
    e.preventDefault();
    e.stopPropagation();
  };

  // 노드 클릭 → 선택 또는 툴바 토글
  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected && onToggleToolbar) {
      onToggleToolbar(node.id);
    } else if (onSelect) {
      onSelect(node.id);
    }
  };

  // 자식 노드 추가
  const handleAddChild = (e) => {
    e.stopPropagation();
    const childNode = createChildNode(node.id, '새 노드', node.color);
    const existingCount = node.children ? node.children.length : 0;

    // direction 결정
    let childDirection;
    if (node.isRoot) {
      const rightCount = node.children.filter(c => (c.direction || 'right') === 'right').length;
      const leftCount = node.children.filter(c => c.direction === 'left').length;
      childDirection = leftCount <= rightCount ? 'left' : 'right';
    } else {
      childDirection = node.direction || 'right';
    }

    childNode.direction = childDirection;
    childNode.position = calculateNewChildPosition(position, existingCount, undefined, childDirection);
    if (onAddChild) onAddChild(node.id, childNode);
  };

  // 자식 수 계산
  const countDescendants = (n) => {
    if (!n.children || n.children.length === 0) return 0;
    return n.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
  };

  // 삭제
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (node.isRoot) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    if (onDelete) onDelete(node.id);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // 스타일 변경 핸들러
  const handleStyleChange = useCallback((styleProps) => {
    updateNodeStyle(node.id, styleProps);
  }, [node.id, updateNodeStyle]);

  // 노드 스타일
  const containerStyle = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor: node.color || '#4A90E2',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isEditing ? 'text' : 'move',
    boxShadow: isSelected
      ? '0 0 0 3px #1890ff, 0 0 12px rgba(24, 144, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: isDragging ? 'none' : 'width 0.2s ease, height 0.2s ease, background-color 0.3s ease, box-shadow 0.2s ease',
    userSelect: 'none',
    border: 'none',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
    ...(isDragging && {
      transform: `scale(${zoomLevel}) scale(1.05)`,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      zIndex: 1000
    })
  };

  const textStyle = {
    color: textColor || '#FFFFFF',
    fontSize: `${fontSize || 16}px`,
    fontWeight: fontWeight || '500',
    fontStyle: fontStyle || 'normal',
    textAlign: 'center',
    lineHeight: 1.2,
  };

  const actionBtnBase = {
    position: 'absolute',
    width: 24,
    height: 24,
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
    border: '2px solid white',
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center'
  };

  return (
    <div
      data-testid="node-container"
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 편집 툴바 — showToolbar로만 제어 */}
      {showToolbar && !isDragging && !isEditing && (
        <NodeEditorToolbar
          style={nodeStyle}
          onStyleChange={handleStyleChange}
        />
      )}

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
            ...textStyle,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '90%',
            cursor: 'text',
          }}
        />
      ) : (
        <div style={{ ...textStyle, cursor: 'pointer', padding: '0 8px' }}>
          {text}
        </div>
      )}

      {isHovered && (
        <div
          style={{ ...actionBtnBase, right: -12, top: '50%', transform: 'translateY(-50%)', backgroundColor: '#52c41a' }}
          onClick={handleAddChild}
          onMouseDown={(e) => e.stopPropagation()}
          title="자식 노드 추가"
        >
          +
        </div>
      )}

      {isHovered && !node.isRoot && (
        <div
          data-testid="delete-button"
          style={{ ...actionBtnBase, left: -12, top: '50%', transform: 'translateY(-50%)', backgroundColor: '#e74c3c' }}
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
