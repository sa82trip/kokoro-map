import React, { useState } from 'react';
import Node from './Node';
import useMindMapStore from '../../store/MindMapStore';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

// 부모-자식 연결선 렌더링
const renderConnections = (node) => {
  if (!node || !node.children || node.children.length === 0) return [];

  const lines = [];
  const x1 = node.position.x + NODE_WIDTH;
  const y1 = node.position.y + NODE_HEIGHT / 2;

  node.children.forEach((child) => {
    const x2 = child.position.x;
    const y2 = child.position.y + NODE_HEIGHT / 2;

    // 베지어 곡선 제어점
    const midX = (x1 + x2) / 2;

    lines.push(
      <path
        key={`line-${node.id}-${child.id}`}
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="#b0b8c8"
        strokeWidth={2}
        strokeLinecap="round"
      />
    );

    // 재귀적으로 자식의 자식도 렌더링
    lines.push(...renderConnections(child));
  });

  return lines;
};

const MindMapContainer = ({ data }) => {
  const { addNode } = useMindMapStore();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  if (!data) {
    return null;
  }

  // 자식 노드 추가 핸들러
  const handleAddChild = (parentId, childNode) => {
    addNode(parentId, childNode);
    setSelectedNodeId(parentId);
  };

  // 컨테이너 클릭 시 선택 해제
  const handleContainerClick = (e) => {
    if (e.target.classList.contains('mindmap-container')) {
      setSelectedNodeId(null);
    }
  };

  // 노드 렌더링 (재귀)
  const renderNodes = (node) => {
    if (!node) return null;

    return (
      <React.Fragment key={node.id}>
        <Node
          node={node}
          position={node.position || { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 40 }}
          onAddChild={handleAddChild}
          isSelected={selectedNodeId === node.id}
        />
        {node.children && node.children.map(child => renderNodes(child))}
      </React.Fragment>
    );
  };

  const connections = renderConnections(data);

  return (
    <div
      className="mindmap-container"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #f5f7fa, #c3cfe2)'
      }}
      onClick={handleContainerClick}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {connections}
      </svg>
      {renderNodes(data)}
    </div>
  );
};

export default MindMapContainer;
