import { useEffect, useCallback, useState } from 'react';
import useMindMapStore from '../store/MindMapStore';
import useFileManagerStore from '../store/FileManagerStore';
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
  const [showHelp, setShowHelp] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // 입력 필드에서는 무시
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    const store = useMindMapStore.getState();
    const { mindMapData: data, selectedNodeId: selId } = store;

    // Escape: 선택 해제 또는 도움말 닫기
    if (e.key === 'Escape') {
      if (showHelp) {
        setShowHelp(false);
      } else {
        store.setToolbarNodeId(null);
        store.setSelectedNodeId(null);
      }
      return;
    }

    // ?: 단축키 도움말 토글
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      setShowHelp((prev) => !prev);
      return;
    }

    // Ctrl+S: 저장
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (data) {
        const fm = useFileManagerStore.getState();
        if (fm.activeDocumentId) {
          fm.saveActiveDocument(data);
          setSaveFeedback(true);
          setTimeout(() => setSaveFeedback(false), 1500);
        }
      }
      return;
    }

    // 선택된 노드가 없으면 아래 단축키 무시
    if (!selId || !data) return;

    const selectedNode = findNodeById(data, selId);

    // Space: 툴바 토글
    if (e.key === ' ') {
      e.preventDefault();
      const currentToolbar = store.toolbarNodeId;
      store.setToolbarNodeId(currentToolbar === selId ? null : selId);
      return;
    }

    // F2 / C: 선택된 노드 이름 변경 (편집 모드 진입)
    if (e.key === 'F2' || e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      store.setToolbarNodeId(null);
      store.setEditingNodeId(selId);
      return;
    }

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
        const existingCount = selectedNode.children ? selectedNode.children.length : 0;

        // direction 결정
        let childDirection;
        if (selectedNode.isRoot) {
          const rightCount = selectedNode.children.filter(c => (c.direction || 'right') === 'right').length;
          const leftCount = selectedNode.children.filter(c => c.direction === 'left').length;
          childDirection = leftCount <= rightCount ? 'left' : 'right';
        } else {
          childDirection = selectedNode.direction || 'right';
        }
        newNode.direction = childDirection;

        const newPos = calculateNewChildPosition(selectedNode.position || { x: 0, y: 0 }, existingCount, undefined, childDirection);
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
        const existingCount = parent.children ? parent.children.length : 0;

        // direction 결정
        let childDirection;
        if (parent.isRoot) {
          const rightCount = parent.children.filter(c => (c.direction || 'right') === 'right').length;
          const leftCount = parent.children.filter(c => c.direction === 'left').length;
          childDirection = leftCount <= rightCount ? 'left' : 'right';
        } else {
          childDirection = parent.direction || 'right';
        }
        newNode.direction = childDirection;

        const newPos = calculateNewChildPosition(parent.position || { x: 0, y: 0 }, existingCount, undefined, childDirection);
        newNode.position = newPos;
        store.addNode(parent.id, newNode);
        store.setSelectedNodeId(newNode.id);
      }
      return;
    }

    // 화살표 키: 노드 탐색 (이동 시 툴바 닫기)
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (selectedNode?.children?.length > 0) {
        store.setToolbarNodeId(null);
        store.setSelectedNodeId(selectedNode.children[0].id);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const parent = findParent(data, selId);
      if (parent) {
        store.setToolbarNodeId(null);
        store.setSelectedNodeId(parent.id);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevSibling = findPreviousSibling(data, selId);
      if (prevSibling) {
        store.setToolbarNodeId(null);
        store.setSelectedNodeId(prevSibling.id);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextSibling = findNextSibling(data, selId);
      if (nextSibling) {
        store.setToolbarNodeId(null);
        store.setSelectedNodeId(nextSibling.id);
      }
      return;
    }
  }, [showHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp, saveFeedback };
};

export default useKeyboardShortcuts;
