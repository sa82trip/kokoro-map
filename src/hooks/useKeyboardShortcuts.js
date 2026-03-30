import { useEffect, useCallback } from 'react';
import useMindMapStore from '../store/MindMapStore';
import { createChildNode } from '../types/NodeTypes';
import { calculateNewChildPosition } from '../utils/LayoutEngine';

// 트리 탐색 유틸리티
const findNodeById = (node, id) => {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
};

const findParent = (node, targetId, parent = null) => {
  if (!node) return null;
  if (node.id === targetId) return parent;
  if (node.children) {
    for (const child of node.children) {
      const found = findParent(child, targetId, node);
      if (found !== null) return found;
    }
  }
  return null;
};

const findPreviousSibling = (data, nodeId) => {
  const parent = findParent(data, nodeId);
  if (!parent || !parent.children) return null;
  const idx = parent.children.findIndex(c => c.id === nodeId);
  if (idx <= 0) return parent; // 첫 번째 자식이면 부모 반환
  return parent.children[idx - 1];
};

const findNextSibling = (data, nodeId) => {
  const parent = findParent(data, nodeId);
  if (!parent || !parent.children) return null;
  const idx = parent.children.findIndex(c => c.id === nodeId);
  if (idx === -1 || idx >= parent.children.length - 1) return null;
  return parent.children[idx + 1];
};

const useKeyboardShortcuts = () => {
  const {
    mindMapData,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    deleteNode,
    saveNodePositions
  } = useMindMapStore();

  const handleKeyDown = useCallback((e) => {
    // 입력 필드에서는 무시
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    const store = useMindMapStore.getState();
    const { mindMapData: data, selectedNodeId: selId } = store;

    // Escape: 선택 해제
    if (e.key === 'Escape') {
      store.setSelectedNodeId(null);
      return;
    }

    // 선택된 노드가 없으면 아래 단축키 무시
    if (!selId || !data) return;

    const selectedNode = findNodeById(data, selId);

    // Delete/Backspace: 노드 삭제
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (!selectedNode?.isRoot) {
        store.deleteNode(selId);
        store.setSelectedNodeId(null);
      }
      return;
    }

    // Enter: 자식 노드 추가
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedNode) {
        const parentColor = selectedNode.color || '#4A90E2';
        const newNode = createChildNode(selId, '새 노드', parentColor);
        const newPos = calculateNewChildPosition(selectedNode, newNode);
        newNode.position = newPos;
        store.addNode(selId, newNode);
        store.setSelectedNodeId(newNode.id);
      }
      return;
    }

    // Tab: 형제 노드 추가 (부모의 자식으로)
    if (e.key === 'Tab') {
      e.preventDefault();
      const parent = findParent(data, selId);
      if (parent) {
        const parentColor = parent.color || '#4A90E2';
        const newNode = createChildNode(parent.id, '새 노드', parentColor);
        const newPos = calculateNewChildPosition(parent, newNode);
        newNode.position = newPos;
        store.addNode(parent.id, newNode);
        store.setSelectedNodeId(newNode.id);
      }
      return;
    }

    // 화살표 키: 노드 탐색
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      // 첫 번째 자식으로 이동
      if (selectedNode?.children?.length > 0) {
        store.setSelectedNodeId(selectedNode.children[0].id);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // 부모로 이동
      const parent = findParent(data, selId);
      if (parent) {
        store.setSelectedNodeId(parent.id);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      // 이전 형제로 이동
      const prevSibling = findPreviousSibling(data, selId);
      if (prevSibling) {
        store.setSelectedNodeId(prevSibling.id);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // 다음 형제로 이동
      const nextSibling = findNextSibling(data, selId);
      if (nextSibling) {
        store.setSelectedNodeId(nextSibling.id);
      }
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
