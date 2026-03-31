import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import useMindMapStore from '../../store/MindMapStore';
import { measureText } from '../../utils/TextMeasurer';
import { DEFAULT_NODE_STYLE } from '../../types/NodeTypes';

import { calculateAutoLayout } from '../../utils/LayoutEngine';
import MobileToolbar from './MobileToolbar';
import { useIsMobile, useTouchSupport } from '../../components/MobileDetector';
import { IS_IOS } from '../../components/MobileDetector';
import { useTouch } from '../../hooks/useTouch';

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

  // 모바일 감지
  const { isMobile, deviceType } = useIsMobile();
  const hasTouchSupport = useTouchSupport();

  // 터치 드래그 상태
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // 핀치 줌 상태
  const [isPinching, setIsPinching] = useState(false);
  const pinchStartRef = useRef({ distance: 0, scale: 1 });

  // 패닝 상태
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportStartRef = useRef({ x: 0, y: 0 });

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    if (!hasTouchSupport || e.touches.length > 2) return;

    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // 더블 탭 체크
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // 더블 탭 시 중앙으로 이동
        resetViewport();
        return;
      }
      lastTapRef.current = now;

      // 단일 터치 시작
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // 핀치 줌 시작
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      pinchStartRef.current = {
        distance,
        scale: zoomLevel
      };
      setIsPinching(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!hasTouchSupport) return;

    e.preventDefault();

    if (e.touches.length === 1 && !isPinching) {
      // 터치 드래그
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        setIsDragging(true);
        setViewport({
          x: viewport.x + dx / zoomLevel,
          y: viewport.y + dy / zoomLevel
        });
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    } else if (e.touches.length === 2 && isPinching) {
      // 핀치 줌
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const scaleRatio = distance / pinchStartRef.current.distance;
      const newZoom = Math.max(0.25, Math.min(3.0, pinchStartRef.current.scale * scaleRatio));

      // 줌 포인트 계산 (터치 중앙)
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      // 뷰포트 조정
      const newViewport = {
        x: viewport.x + (centerX - window.innerWidth / 2) * (1 / zoomLevel - 1 / newZoom),
        y: viewport.y + (centerY - window.innerHeight / 2) * (1 / zoomLevel - 1 / newZoom)
      };

      setViewport(newViewport);
      setZoomLevel(newZoom);
    }
  };

  const handleTouchEnd = (e) => {
    if (!hasTouchSupport) return;

    setIsDragging(false);
    setIsPinching(false);
  };

  // 터치 이벤트 리스너
  useEffect(() => {
    if (hasTouchSupport) {
      const container = document.getElementById('mindmap-container');
      if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: false });
      }

      return () => {
        if (container) {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
          container.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
  }, [hasTouchSupport, viewport, zoomLevel]);

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

  // 데이터가 없을 때 로딩 상태 표시
  if (!data) {
    console.log('MindMapContainer: No data available, showing loading state');
    return (
      <div className="loading-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #f5f7fa, #c3cfe2)',
        zIndex: 100
      }}>
        <div className="loading-spinner" />
        <p style={{ marginTop: 20, color: '#666' }}>마인드맵 로딩 중...</p>
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          데이터가 없으면 새 마인드맵을 생성합니다
        </p>
      </div>
    );
  }

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

  // 디버깅: 컴포넌트 상태 로그
  console.log('MindMapContainer rendering:', {
    isMobile,
    hasTouchSupport,
    IS_IOS,
    data: !!data,
    viewport,
    zoomLevel,
    connectionConfig
  });

  return (
    <div
      className="mindmap-container"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #f5f7fa, #c3cfe2)',
        paddingTop: isMobile ? 64 : 52,
        cursor: isPanning ? 'grabbing' : 'grab',
        touchAction: hasTouchSupport ? 'manipulation' : 'auto',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleContainerClick}
      onTouchStart={hasTouchSupport ? (e) => {
        e.preventDefault();
        handleTouchStart(e);
      } : undefined}
      onTouchMove={hasTouchSupport ? (e) => {
        if (e.touches.length === 1) {
          e.preventDefault();
        }
        handleTouchMove(e);
      } : undefined}
      onTouchEnd={hasTouchSupport ? handleTouchEnd : undefined}
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

      {/* 모바일 툴바 */}
      {isMobile && hasTouchSupport && (
        <MobileToolbar mindMapData={data} />
      )}
    </div>
  );
};

export default MindMapContainer;
