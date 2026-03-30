import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import useMindMapStore from '../../store/MindMapStore';
import { measureText } from '../../utils/TextMeasurer';
import { DEFAULT_NODE_STYLE } from '../../types/NodeTypes';

import { calculateAutoLayout } from '../../utils/LayoutEngine';

const NODE_HEIGHT = 80;

// 노드 크기 측정하여 연결선 위치 계산
const getNodeSize = (node) => {
  if (!node) return { width: 200, height: 80 };
  const nodeStyle = node.style || {};
  const measured = measureText(node.text, nodeStyle?.fontSize || 16, nodeStyle?.fontWeight, nodeStyle?.fontStyle);
  return { width: Math.max(120, measured.width), height: Math.max(40, measured.height) };
};

// 부모-자식 연결선 렌더링
const renderConnections = (node, connectionStyle = 'bezier', connectionColor = '#b0b8c8') => {
  if (!node || !node.children || node.children.length === 0) return [];

  const lines = [];
  const pos = node.position || { x: 0, y: 0 };
  const size = getNodeSize(node);
  const x1 = pos.x + size.width;
  const y1 = pos.y + size.height / 2;

  node.children.forEach((child) => {
    const childPos = child.position || { x: 0, y: 0 };
    const childSize = getNodeSize(child);
    const x2 = childPos.x;
    const y2 = childPos.y + childSize.height / 2;

    const midX = (x1 + x2) / 2;

    const pathD = connectionStyle === 'straight'
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    lines.push(
      <path
        key={`line-${node.id}-${child.id}`}
        d={pathD}
        fill="none"
        stroke={connectionColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );

    lines.push(...renderConnections(child, connectionStyle, connectionColor));
  });

  return lines;
};

const MindMapContainer = ({ data }) => {
  const { addNode, deleteNode } = useMindMapStore();
  const connectionStyle = useMindMapStore((state) => state.connectionStyle);
  const connectionColor = useMindMapStore((state) => state.connectionColor);
  const viewport = useMindMapStore((state) => state.viewport);
  const setViewport = useMindMapStore((state) => state.setViewport);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useMindMapStore((state) => state.setSelectedNodeId);

  // 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportStartRef = useRef({ x: 0, y: 0 });

  // document 클릭으로 노드 선택 해제 — 모든 hooks는 early return 전에 호출
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('[data-testid="node-container"]') &&
          !target.closest('[data-testid="node-editor-toolbar"]')) {
        setSelectedNodeId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 패닝 마우스 이벤트
  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setViewport({
        x: viewportStartRef.current.x + dx,
        y: viewportStartRef.current.y + dy
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, setViewport]);

  if (!data) return null;

  // 캔버스 배경 드래그 → 패닝
  const handleCanvasMouseDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.clientY < 52) return;

    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    viewportStartRef.current = { x: viewport.x, y: viewport.y };
    e.preventDefault();
  };

  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId);
  };

  const handleAddChild = (parentId, childNode) => {
    addNode(parentId, childNode);
    setSelectedNodeId(parentId);
  };

  const handleContainerClick = (e) => {
    if (isPanning) return;
    if (e.target.classList.contains('mindmap-container')) {
      setSelectedNodeId(null);
    }
  };

  const handleDeleteNode = (nodeId) => {
    deleteNode(nodeId);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const renderNodes = (node) => {
    if (!node) return null;
    return (
      <React.Fragment key={node.id}>
        <Node
          node={node}
          position={node.position || { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 40 }}
          onAddChild={handleAddChild}
          onDelete={handleDeleteNode}
          isSelected={selectedNodeId === node.id}
          onSelect={handleNodeSelect}
        />
        {node.children && node.children.map(child => renderNodes(child))}
      </React.Fragment>
    );
  };

  const connections = renderConnections(data, connectionStyle, connectionColor);

  return (
    <div
      className="mindmap-container"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #f5f7fa, #c3cfe2)',
        paddingTop: 52,
        cursor: isPanning ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleContainerClick}
    >
      <div
        data-testid="canvas-viewport"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translate(${viewport.x}px, ${viewport.y}px)`,
          pointerEvents: 'none'
        }}
      >
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          {connections}
        </svg>
        <div style={{ pointerEvents: 'auto' }}>
          {renderNodes(data)}
        </div>
      </div>
    </div>
  );
};

export default MindMapContainer;
