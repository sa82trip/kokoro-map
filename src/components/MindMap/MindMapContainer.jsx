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
const renderConnections = (node, connectionConfig, zoomLevel = 1.0) => {
  const {
    style: connectionStyle = 'bezier',
    color: connectionColor = '#b0b8c8',
    arrow: connectionArrow = false,
    dashed: connectionDashed = false,
    thickness: connectionWidth = 2,
    colorMode: connectionColorMode = 'global'
  } = connectionConfig || {};
  if (!node || !node.children || node.children.length === 0) return { markerDefs: new Map(), paths: [] };

  const markerDefs = new Map();
  const paths = [];
  const pos = node.position || { x: 0, y: 0 };
  const size = getNodeSize(node);

  node.children.forEach((child) => {
    const childPos = child.position || { x: 0, y: 0 };
    const childSize = getNodeSize(child);

    // 배율 적용된 위치 계산
    const scaledPos = {
      x: pos.x * zoomLevel,
      y: pos.y * zoomLevel
    };
    const scaledChildPos = {
      x: childPos.x * zoomLevel,
      y: childPos.y * zoomLevel
    };
    const scaledSize = {
      width: size.width * zoomLevel,
      height: size.height * zoomLevel
    };
    const scaledChildSize = {
      width: childSize.width * zoomLevel,
      height: childSize.height * zoomLevel
    };

    // 연결선은 노드 중앙에서 시작 (수직 중앙)
    const x1 = scaledPos.x + scaledSize.width / 2;
    const y1 = scaledPos.y + scaledSize.height / 2;
    // 연결선은 자식 노드 중앙에서 끝나도록 (수직 중앙)
    const x2 = scaledChildPos.x + scaledChildSize.width / 2;
    const y2 = scaledChildPos.y + scaledChildSize.height / 2;

    const midX = (x1 + x2) / 2;

    const pathD = connectionStyle === 'straight'
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    const lineColor = connectionConfig.colorMode === 'branch'
      ? (node.color || '#4A90E2')
      : (connectionConfig.inheritColor ? (node.color || '#4A90E2') : connectionConfig.color);

    const markerId = `arrowhead-${lineColor.replace('#', '')}`;
    if (connectionArrow && !markerDefs.has(markerId)) {
      markerDefs.set(markerId, (
        <marker
          key={markerId}
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={lineColor} />
        </marker>
      ));
    }

    paths.push(
      <path
        key={`line-${node.id}-${child.id}`}
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth={connectionWidth}
        strokeLinecap="round"
        strokeDasharray={connectionDashed ? '8 4' : undefined}
        markerEnd={connectionArrow ? `url(#${markerId})` : undefined}
      />
    );

    const childResult = renderConnections(child, connectionConfig, zoomLevel);
    childResult.markerDefs.forEach((v, k) => { if (!markerDefs.has(k)) markerDefs.set(k, v); });
    paths.push(...childResult.paths);
  });

  return { markerDefs, paths };
};

const MindMapContainer = ({ data }) => {
  const { addNode, deleteNode } = useMindMapStore();
  const connectionConfig = useMindMapStore((state) => state.connectionConfig);
  const viewport = useMindMapStore((state) => state.viewport);
  const setViewport = useMindMapStore((state) => state.setViewport);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useMindMapStore((state) => state.setSelectedNodeId);
  const toolbarNodeId = useMindMapStore((state) => state.toolbarNodeId);
  const setToolbarNodeId = useMindMapStore((state) => state.setToolbarNodeId);
  const zoomLevel = useMindMapStore((state) => state.zoomLevel);

  // 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportStartRef = useRef({ x: 0, y: 0 });

  // document 클릭으로 노드 선택 해제 + 툴바 닫기 — 모든 hooks는 early return 전에 호출
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('[data-testid="node-container"]') &&
          !target.closest('[data-testid="node-editor-toolbar"]')) {
        setSelectedNodeId(null);
        setToolbarNodeId(null);
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

  const handleToggleToolbar = (nodeId) => {
    const current = useMindMapStore.getState().toolbarNodeId;
    setToolbarNodeId(current === nodeId ? null : nodeId);
  };

  const handleAddChild = (parentId, childNode) => {
    addNode(parentId, childNode);
    setSelectedNodeId(parentId);
  };

  const handleContainerClick = (e) => {
    if (isPanning) return;
    if (e.target.classList.contains('mindmap-container')) {
      setSelectedNodeId(null);
      setToolbarNodeId(null);
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

    // 확대/축소에 따라 위치 조정
    const scaledPosition = node.position ? {
      x: node.position.x * zoomLevel,
      y: node.position.y * zoomLevel
    } : { x: 0, y: 0 };

    return (
      <React.Fragment key={node.id}>
        <Node
          node={node}
          position={scaledPosition}
          onAddChild={handleAddChild}
          onDelete={handleDeleteNode}
          isSelected={selectedNodeId === node.id}
          onSelect={handleNodeSelect}
          showToolbar={toolbarNodeId === node.id}
          onToggleToolbar={handleToggleToolbar}
        />
        {node.children && node.children.map(child => renderNodes(child))}
      </React.Fragment>
    );
  };

  const { markerDefs, paths } = renderConnections(data, connectionConfig, zoomLevel);

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
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
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
          <defs>{Array.from(markerDefs.values())}</defs>
          {paths}
        </svg>
        <div style={{ pointerEvents: 'auto' }}>
          {renderNodes(data)}
        </div>
      </div>
    </div>
  );
};

export default MindMapContainer;
