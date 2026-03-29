import { create } from 'zustand';
import { validateNode, validateMindMap } from '../utils/NodeValidator';
import { createRootNode } from '../types/NodeTypes';

// 마인드맵 스토어
const useMindMapStore = create((set, get) => ({
  // 상태
  mindMapData: null,
  loading: false,
  error: null,
  validationErrors: [],

  // 로딩 상태 설정
  setLoading: (isLoading) => set({ loading: isLoading }),

  // 에러 상태 설정
  setError: (err) => set({ error: err }),

  // 액션
  setMindMapData: (data) => {
    const validation = validateMindMap(data);

    if (!validation.isValid) {
      set({
        mindMapData: null,
        error: '데이터 유효성 검증 실패',
        validationErrors: validation.errors
      });
      return;
    }

    set({
      mindMapData: data,
      error: null,
      validationErrors: []
    });
  },

  // 노드 텍스트 업데이트
  updateNodeText: (nodeId, newText) => set((state) => {
    if (!state.mindMapData) return state;

    // 유효성 검증
    const nodeToUpdate = findNodeById(state.mindMapData, nodeId);
    if (!nodeToUpdate) return state;

    const updatedNode = { ...nodeToUpdate, text: newText };
    const validation = validateNode(updatedNode);

    if (!validation.isValid) {
      return { ...state, error: validation.errors.join(', ') };
    }

    const updateNode = (node) => {
      if (node.id === nodeId) {
        return updatedNode;
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };

    const updatedMindMap = updateNode(state.mindMapData);

    // 전체 유효성 검증
    const totalValidation = validateMindMap(updatedMindMap);
    if (!totalValidation.isValid) {
      return { ...state, error: totalValidation.errors.map(e => e.errors.join(', ')).join('; ') };
    }

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 위치 업데이트
  updateNodePosition: (nodeId, newPosition) => set((state) => {
    if (!state.mindMapData) return state;

    // 유효성 검증
    if (typeof newPosition.x !== 'number' || typeof newPosition.y !== 'number') {
      return { ...state, error: '유효하지 않은 위치입니다' };
    }

    const updateNode = (node) => {
      if (node.id === nodeId) {
        return { ...node, position: newPosition };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };

    const updatedMindMap = updateNode(state.mindMapData);

    // 전체 유효성 검증
    const validation = validateMindMap(updatedMindMap);
    if (!validation.isValid) {
      return { ...state, error: validation.errors.map(e => e.errors.join(', ')).join('; ') };
    }

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 추가
  addNode: (parentId, newNodeData) => set((state) => {
    if (!state.mindMapData) return state;

    const validation = validateNode(newNodeData);
    if (!validation.isValid) {
      return { ...state, error: validation.errors.join(', ') };
    }

    const updateNode = (node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, newNodeData]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        };
      }
      return node;
    };

    const updatedMindMap = updateNode(state.mindMapData);

    // 자식 노드 수 제한 검사
    const countNodes = (node) => {
      if (!node.children) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };

    const nodeCount = countNodes(updatedMindMap);
    if (nodeCount > 1000) {
      return { ...state, error: '노드 수가 최대 한도를 초과했습니다 (1000개)' };
    }

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 삭제
  deleteNode: (nodeId) => set((state) => {
    if (!state.mindMapData) return state;

    const updateNode = (node) => {
      // 현재 노드가 삭제 대상인 경우 제외
      if (node.id === nodeId) return null;

      if (node.children) {
        const filteredChildren = node.children
          .map(updateNode)
          .filter(child => child !== null);

        return {
          ...node,
          children: filteredChildren
        };
      }

      return node;
    };

    const updatedMindMap = updateNode(state.mindMapData);

    // 루트 노드가 삭제되지 않았는지 확인
    if (!updatedMindMap) {
      return { ...state, error: '루트 노드를 삭제할 수 없습니다' };
    }

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 초기화
  reset: () => set({
    mindMapData: null,
    loading: false,
    error: null,
    validationErrors: []
  })
}));

// 유틸리티 함수: ID로 노드 찾기
const findNodeById = (node, nodeId) => {
  if (node.id === nodeId) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return null;
};

export default useMindMapStore;