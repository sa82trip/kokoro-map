import { create } from 'zustand';
import { validateNode, validateMindMap } from '../utils/NodeValidator';
import { createRootNode, DEFAULT_NODE_STYLE } from '../types/NodeTypes';
import { calculateAutoLayout } from '../utils/LayoutEngine';

const STORAGE_KEY = 'mindmap-app-data';

// localStorage 유틸리티
const storage = {
  save: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
      return false;
    }
  },
  load: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('localStorage 로드 실패:', e);
      return null;
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage 삭제 실패:', e);
    }
  }
};

// 마인드맵 스토어
const useMindMapStore = create((set, get) => ({
  // 상태
  mindMapData: null,
  loading: false,
  error: null,
  validationErrors: [],
  layoutConfig: { horizontalGap: 100, verticalGap: 30 },
  connectionStyle: 'bezier',
  connectionColor: '#b0b8c8',
  viewport: { x: 0, y: 0 },

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

    storage.save(data);
  },

  // localStorage에서 데이터 로드
  loadFromStorage: () => {
    const savedData = storage.load();
    if (savedData) {
      const validation = validateMindMap(savedData);
      if (validation.isValid) {
        // 기존 노드에 style 필드 마이그레이션
        const migrateNode = (node) => {
          const withStyle = { ...node, style: node.style || { ...DEFAULT_NODE_STYLE } };
          if (withStyle.children) {
            withStyle.children = withStyle.children.map(migrateNode);
          }
          return withStyle;
        };
        const migrated = migrateNode(savedData);
        set({ mindMapData: migrated, error: null });
        storage.save(migrated);
        return true;
      }
    }
    return false;
  },

  // 새 마인드맵 생성
  createNewMindMap: (title = '마인드맵') => {
    const newRoot = createRootNode(title);
    const layouted = calculateAutoLayout(newRoot);

    set({
      mindMapData: layouted || newRoot,
      error: null,
      validationErrors: []
    });

    storage.save(layouted || newRoot);
  },

  // 자동 레이아웃 적용
  applyAutoLayout: () => {
    const { mindMapData, layoutConfig } = get();
    if (!mindMapData) return;

    const layouted = calculateAutoLayout(mindMapData, layoutConfig);
    if (layouted) {
      set({ mindMapData: layouted });
      storage.save(layouted);
    }
  },

  // 마인드맵 제목 업데이트 (루트 노드 텍스트)
  updateMindMapTitle: (newTitle) => {
    const { mindMapData } = get();
    if (!mindMapData) return;

    const trimmed = newTitle.trim();
    if (!trimmed || trimmed.length > 200) return;

    const updateRoot = (node) => {
      if (node.isRoot) {
        return { ...node, text: trimmed };
      }
      return node;
    };

    const updated = updateRoot(mindMapData);
    set({ mindMapData: updated });
    storage.save(updated);
  },

  // 노드 텍스트 업데이트
  updateNodeText: (nodeId, newText) => set((state) => {
    if (!state.mindMapData) return state;

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

    const totalValidation = validateMindMap(updatedMindMap);
    if (!totalValidation.isValid) {
      return { ...state, error: totalValidation.errors.map(e => e.errors.join(', ')).join('; ') };
    }

    storage.save(updatedMindMap);

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 위치 업데이트
  updateNodePosition: (nodeId, newPosition) => set((state) => {
    if (!state.mindMapData) return state;

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

    // 드래그 중 잦은 호출에서 전체 validation/localStorage 저장 생략
    // (position은 이미 type 체크됨, 저장은 drag end 시 수행)
    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 위치 저장 (drag end 시 호출)
  saveNodePositions: () => {
    const { mindMapData } = get();
    if (mindMapData) {
      storage.save(mindMapData);
    }
  },

  // 노드 스타일 업데이트
  updateNodeStyle: (nodeId, styleProps) => set((state) => {
    if (!state.mindMapData) return state;

    const validFontSizes = (v) => typeof v === 'number' && v >= 8 && v <= 72;
    const VALID_WEIGHTS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const VALID_STYLES = ['normal', 'italic'];
    const validFontWeights = (v) => VALID_WEIGHTS.indexOf(v) !== -1;
    const validFontStyles = (v) => VALID_STYLES.indexOf(v) !== -1;
    const validColor = (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);

    const allowedKeys = { fontSize: validFontSizes, textColor: validColor, fontWeight: validFontWeights, fontStyle: validFontStyles, backgroundColor: validColor };
    const filtered = {};
    for (const [key, value] of Object.entries(styleProps)) {
      if (allowedKeys[key] && allowedKeys[key](value)) {
        filtered[key] = value;
      }
    }

    if (Object.keys(filtered).length === 0) return state;

    const updateNode = (node) => {
      if (node.id === nodeId) {
        const currentStyle = node.style || { ...DEFAULT_NODE_STYLE };
        return { ...node, style: { ...currentStyle, ...filtered } };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateNode) };
      }
      return node;
    };

    const updatedMindMap = updateNode(state.mindMapData);
    storage.save(updatedMindMap);

    return { mindMapData: updatedMindMap, error: null };
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

    const countNodes = (node) => {
      if (!node.children) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };

    const nodeCount = countNodes(updatedMindMap);
    if (nodeCount > 1000) {
      return { ...state, error: '노드 수가 최대 한도를 초과했습니다 (1000개)' };
    }

    storage.save(updatedMindMap);

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 노드 삭제
  deleteNode: (nodeId) => set((state) => {
    if (!state.mindMapData) return state;

    const updateNode = (node) => {
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

    if (!updatedMindMap) {
      return { ...state, error: '루트 노드를 삭제할 수 없습니다' };
    }

    storage.save(updatedMindMap);

    return {
      mindMapData: updatedMindMap,
      error: null
    };
  }),

  // 연결선 스타일 변경
  setConnectionStyle: (style) => {
    if (style !== 'bezier' && style !== 'straight') return;
    set({ connectionStyle: style });
  },

  // 연결선 색상 변경
  setConnectionColor: (color) => {
    if (typeof color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(color)) return;
    set({ connectionColor: color });
  },

  // 전체 레이아웃 재조정 — 간격 설정도 기본값으로 초기화 후 재배치
  resetLayout: () => {
    const { mindMapData } = get();
    if (!mindMapData) return;
    const defaultConfig = { horizontalGap: 100, verticalGap: 30 };
    const layouted = calculateAutoLayout(mindMapData, defaultConfig);
    if (layouted) {
      set({ mindMapData: layouted, layoutConfig: defaultConfig, error: null });
      storage.save(layouted);
    }
  },

  // 레이아웃 설정 변경
  setLayoutConfig: (config) => set((state) => {
    const current = state.layoutConfig || { horizontalGap: 100, verticalGap: 30 };
    const newConfig = Object.assign({}, current);

    if (config.horizontalGap !== undefined) {
      newConfig.horizontalGap = Math.min(500, Math.max(20, config.horizontalGap));
    }
    if (config.verticalGap !== undefined) {
      newConfig.verticalGap = Math.min(500, Math.max(20, config.verticalGap));
    }

    return { layoutConfig: newConfig };
  }),

  // 뷰포트 패닝
  panViewport: (dx, dy) => set((state) => ({
    viewport: {
      x: state.viewport.x + dx,
      y: state.viewport.y + dy
    }
  })),

  setViewport: (offset) => set({
    viewport: { x: offset.x, y: offset.y }
  }),

  resetViewport: () => set({ viewport: { x: 0, y: 0 } }),

  // 초기화
  reset: () => set({
    mindMapData: null,
    loading: false,
    error: null,
    validationErrors: [],
    layoutConfig: { horizontalGap: 100, verticalGap: 30 },
    connectionStyle: 'bezier',
    connectionColor: '#b0b8c8',
    viewport: { x: 0, y: 0 }
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
