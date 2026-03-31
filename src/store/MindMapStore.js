import { create } from 'zustand';
import { validateNode, validateMindMap } from '../utils/NodeValidator';
import { createRootNode, DEFAULT_NODE_STYLE } from '../types/NodeTypes';
import { calculateAutoLayout } from '../utils/LayoutEngine';
import useFileManagerStore from './FileManagerStore';

const MAX_HISTORY = 50;

// 마인드맵 스토어
const useMindMapStore = create((set, get) => ({
  // 상태
  mindMapData: null,
  loading: false,
  error: null,
  validationErrors: [],
  layoutConfig: { horizontalGap: 100, verticalGap: 30 },
  connectionConfig: {
    style: 'bezier',
    color: '#b0b8c8',
    arrow: false,
    dashed: false,
    thickness: 2,
    inheritColor: false,
    colorMode: 'global'
  },
  viewport: { x: 0, y: 0 },
  zoomLevel: 1.0,
  maxZoom: 3.0,
  minZoom: 0.25,
  zoomStep: 0.25,
  activeDocumentId: null,
  selectedNodeId: null,
  toolbarNodeId: null,
  editingNodeId: null,
  isNodeDragging: false,

  // Undo/Redo 상태
  undoStack: [],
  redoStack: [],
  _preDragSnapshot: null,

  // 로딩 상태 설정
  setLoading: (isLoading) => set({ loading: isLoading }),

  // 에러 상태 설정
  setError: (err) => set({ error: err }),

  // 히스토리 헬퍼: 현재 상태를 undo 스택에 저장
  _pushHistory: () => {
    const { mindMapData, undoStack } = get();
    if (!mindMapData) return;

    const snapshot = JSON.parse(JSON.stringify(mindMapData));
    const newUndoStack = [...undoStack, snapshot].slice(-MAX_HISTORY);

    set({ undoStack: newUndoStack, redoStack: [] });
  },

  // 실행 취소
  undo: () => {
    const { mindMapData, undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const newUndoStack = [...undoStack];
    const previousState = newUndoStack.pop();

    const currentSnapshot = mindMapData ? JSON.parse(JSON.stringify(mindMapData)) : null;
    const newRedoStack = currentSnapshot ? [...redoStack, currentSnapshot] : [...redoStack];

    set({
      mindMapData: previousState,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });

    get()._saveToStorage(previousState);
  },

  // 다시 실행
  redo: () => {
    const { mindMapData, undoStack, redoStack } = get();
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop();

    const currentSnapshot = mindMapData ? JSON.parse(JSON.stringify(mindMapData)) : null;
    const newUndoStack = currentSnapshot ? [...undoStack, currentSnapshot] : [...undoStack];

    set({
      mindMapData: nextState,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    });

    get()._saveToStorage(nextState);
  },

  // Undo 가능 여부
  canUndo: () => get().undoStack.length > 0,

  // Redo 가능 여부
  canRedo: () => get().redoStack.length > 0,

  // 히스토리 초기화
  clearHistory: () => set({ undoStack: [], redoStack: [], _preDragSnapshot: null }),

  // 문서 저장 헬퍼
  _saveToStorage: (data) => {
    const fm = useFileManagerStore.getState();
    if (fm.activeDocumentId) {
      fm.saveActiveDocument(data);
    }
  },

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

    get()._pushHistory();

    set({
      mindMapData: data,
      error: null,
      validationErrors: []
    });

    get()._saveToStorage(data);
  },

  // localStorage에서 데이터 로드
  loadFromStorage: () => {
    const fm = useFileManagerStore.getState();
    const { setLoading } = get();

    // 로딩 시작
    setLoading(true);

    console.log('MindMapStore.loadFromStorage: Starting');
    console.log('FileManager state:', {
      initialized: fm.initialized,
      activeDocumentId: fm.activeDocumentId,
      documents: fm.documents
    });

    // FileManagerStore가 초기화되지 않았으면 초기화
    if (!fm.initialized) {
      console.log('FileManager not initialized, calling initialize()');
      fm.initialize();
    }

    // 활성 문서가 있으면 로드
    if (fm.activeDocumentId) {
      console.log(`Active document ID: ${fm.activeDocumentId}`);
      const savedData = fm.loadDocument(fm.activeDocumentId);
      console.log('Loaded data:', savedData);

      if (savedData) {
        const validation = validateMindMap(savedData);
        console.log('Validation result:', validation);

        if (validation.isValid) {
          const migrateNode = (node) => {
            const withStyle = { ...node, style: node.style || { ...DEFAULT_NODE_STYLE } };
            if (withStyle.children) {
              withStyle.children = withStyle.children.map(migrateNode);
            }
            return withStyle;
          };
          const migrated = migrateNode(savedData);
          console.log('Migrated data:', migrated);

          set({
            mindMapData: migrated,
            error: null,
            activeDocumentId: fm.activeDocumentId,
            undoStack: [],
            redoStack: [],
            _preDragSnapshot: null
          });
          get()._saveToStorage(migrated);
          setLoading(false);
          console.log('Data loaded and set successfully');
          return true;
        } else {
          console.error('Validation failed:', validation.errors);
        }
      }
    }

    // 첫 번째 문서 로드 시도
    if (fm.documents && fm.documents.length > 0) {
      console.log('Trying to load first document');
      const firstDoc = fm.documents[0];
      const savedData = fm.loadDocument(firstDoc.id);
      console.log('First document data:', savedData);

      if (savedData) {
        const validation = validateMindMap(savedData);
        console.log('First document validation:', validation);

        if (validation.isValid) {
          const migrateNode = (node) => {
            const withStyle = { ...node, style: node.style || { ...DEFAULT_NODE_STYLE } };
            if (withStyle.children) {
              withStyle.children = withStyle.children.map(migrateNode);
            }
            return withStyle;
          };
          const migrated = migrateNode(savedData);
          console.log('Migrated first document:', migrated);

          set({
            mindMapData: migrated,
            error: null,
            activeDocumentId: firstDoc.id,
            undoStack: [],
            redoStack: [],
            _preDragSnapshot: null
          });
          get()._saveToStorage(migrated);
          setLoading(false);
          console.log('First document loaded and set successfully');
          return true;
        } else {
          console.error('First document validation failed:', validation.errors);
        }
      }
    }

    console.log('No documents found or load failed, returning false');
    setLoading(false);
    return false;
  },

  // 새 마인드맵 생성
  createNewMindMap: (title = '마인드맵') => {
    const { setLoading } = get();
    console.log('MindMapStore.createNewMindMap: Creating new mind map with title:', title);
    setLoading(true);

    const newRoot = createRootNode(title);
    console.log('Created root node:', newRoot);

    const layouted = calculateAutoLayout(newRoot);
    console.log('Layouted data:', layouted);

    const data = layouted || newRoot;
    const fm = useFileManagerStore.getState();
    console.log('FileManager state before creating document:', {
      initialized: fm.initialized,
      documents: fm.documents
    });

    const docId = fm.createDocument(title, data);
    console.log('Created document with ID:', docId);

    set({
      mindMapData: data,
      error: null,
      validationErrors: [],
      activeDocumentId: docId,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });

    console.log('State set, saving to storage');
    // 저장 완료 후 로딩 상태 종료
    get()._saveToStorage(data);
    setLoading(false);
    console.log('New mind map created successfully');
  },

  // 자동 레이아웃 적용
  applyAutoLayout: () => {
    const { mindMapData, layoutConfig } = get();
    if (!mindMapData) return;

    get()._pushHistory();

    const layouted = calculateAutoLayout(mindMapData, layoutConfig);
    if (layouted) {
      set({ mindMapData: layouted });
      get()._saveToStorage(layouted);
    }
  },

  // 마인드맵 제목 업데이트 (루트 노드 텍스트)
  updateMindMapTitle: (newTitle) => {
    const { mindMapData } = get();
    if (!mindMapData) return;

    const trimmed = newTitle.trim();
    if (!trimmed || trimmed.length > 200) return;

    get()._pushHistory();

    const updateRoot = (node) => {
      if (node.isRoot) {
        return { ...node, text: trimmed };
      }
      return node;
    };

    const updated = updateRoot(mindMapData);
    set({ mindMapData: updated });
    get()._saveToStorage(updated);
  },

  // 노드 텍스트 업데이트
  updateNodeText: (nodeId, newText) => {
    const state = get();
    if (!state.mindMapData) return;

    const nodeToUpdate = findNodeById(state.mindMapData, nodeId);
    if (!nodeToUpdate) return;

    const updatedNode = { ...nodeToUpdate, text: newText };
    const validation = validateNode(updatedNode);

    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') });
      return;
    }

    get()._pushHistory();

    set((s) => {
      if (!s.mindMapData) return s;

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

      const updatedMindMap = updateNode(s.mindMapData);

      const totalValidation = validateMindMap(updatedMindMap);
      if (!totalValidation.isValid) {
        return { ...s, error: totalValidation.errors.map(e => e.errors.join(', ')).join('; ') };
      }

      get()._saveToStorage(updatedMindMap);

      return {
        mindMapData: updatedMindMap,
        error: null
      };
    });
  },

  // 노드 위치 업데이트 (드래그 중)
  updateNodePosition: (nodeId, newPosition) => {
    const { _preDragSnapshot, mindMapData } = get();

    // 드래그 시작 시 스냅샷 캡처
    if (!_preDragSnapshot && mindMapData) {
      set({ _preDragSnapshot: JSON.parse(JSON.stringify(mindMapData)) });
    }

    set((state) => {
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

      return {
        mindMapData: updatedMindMap,
        error: null
      };
    });
  },

  // 노드 위치 저장 (drag end 시 호출)
  saveNodePositions: () => {
    const { mindMapData, _preDragSnapshot, undoStack } = get();

    // 드래그 전 스냅샷을 히스토리에 저장
    if (_preDragSnapshot) {
      const newUndoStack = [...undoStack, _preDragSnapshot].slice(-MAX_HISTORY);
      set({ undoStack: newUndoStack, redoStack: [], _preDragSnapshot: null });
    }

    if (mindMapData) {
      get()._saveToStorage(mindMapData);
    }
  },

  // 노드 스타일 업데이트
  updateNodeStyle: (nodeId, styleProps) => {
    const state = get();
    if (!state.mindMapData) return;

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

    if (Object.keys(filtered).length === 0) return;

    get()._pushHistory();

    set((s) => {
      if (!s.mindMapData) return s;

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

      const updatedMindMap = updateNode(s.mindMapData);
      get()._saveToStorage(updatedMindMap);

      return { mindMapData: updatedMindMap, error: null };
    });
  },

  // 노드 추가
  addNode: (parentId, newNodeData) => {
    const state = get();
    if (!state.mindMapData) return;

    const validation = validateNode(newNodeData);
    if (!validation.isValid) {
      set({ error: validation.errors.join(', ') });
      return;
    }

    get()._pushHistory();

    set((s) => {
      if (!s.mindMapData) return s;

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

      const updatedMindMap = updateNode(s.mindMapData);

      const countNodes = (node) => {
        if (!node.children) return 1;
        return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
      };

      const nodeCount = countNodes(updatedMindMap);
      if (nodeCount > 1000) {
        return { ...s, error: '노드 수가 최대 한도를 초과했습니다 (1000개)' };
      }

      get()._saveToStorage(updatedMindMap);

      return {
        mindMapData: updatedMindMap,
        error: null
      };
    });
  },

  // 노드 삭제
  deleteNode: (nodeId) => {
    const state = get();
    if (!state.mindMapData) return;

    get()._pushHistory();

    set((s) => {
      if (!s.mindMapData) return s;

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

      const updatedMindMap = updateNode(s.mindMapData);

      if (!updatedMindMap) {
        return { ...s, error: '루트 노드를 삭제할 수 없습니다' };
      }

      get()._saveToStorage(updatedMindMap);

      return {
        mindMapData: updatedMindMap,
        error: null
      };
    });
  },

  // 연결line 설정 업데이트 (전체)
  setConnectionConfig: (config) => {
    const current = get().connectionConfig || {
      style: 'bezier',
      color: '#b0b8c8',
      arrow: false,
      dashed: false,
      thickness: 2,
      inheritColor: false,
      colorMode: 'global'
    };

    const newConfig = { ...current, ...config };

    // 값 검증
    if (newConfig.style && newConfig.style !== 'bezier' && newConfig.style !== 'straight') {
      newConfig.style = current.style;
    }
    if (newConfig.color && (!/^#[0-9A-Fa-f]{6}$/.test(newConfig.color))) {
      newConfig.color = current.color;
    }
    if (newConfig.thickness && typeof newConfig.thickness === 'number') {
      newConfig.thickness = Math.min(5, Math.max(1, Math.round(newConfig.thickness)));
    }
    if (newConfig.colorMode && newConfig.colorMode !== 'global' && newConfig.colorMode !== 'branch') {
      newConfig.colorMode = current.colorMode;
    }
    if (newConfig.arrow !== undefined) {
      newConfig.arrow = !!newConfig.arrow;
    }
    if (newConfig.dashed !== undefined) {
      newConfig.dashed = !!newConfig.dashed;
    }
    if (newConfig.inheritColor !== undefined) {
      newConfig.inheritColor = !!newConfig.inheritColor;
    }

    set({ connectionConfig: newConfig });
  },

  // 개별 설정 업데이트 (기존 메서드 호환성)
  setConnectionStyle: (style) => {
    get().setConnectionConfig({ style });
  },

  setConnectionColor: (color) => {
    get().setConnectionConfig({ color });
  },

  setConnectionArrow: (enabled) => {
    get().setConnectionConfig({ arrow: enabled });
  },

  setConnectionDashed: (enabled) => {
    get().setConnectionConfig({ dashed: enabled });
  },

  setConnectionWidth: (width) => {
    get().setConnectionConfig({ thickness: width });
  },

  setConnectionColorMode: (mode) => {
    get().setConnectionConfig({ colorMode: mode });
  },

  // 모바일 레이아웃 초기화
  initializeMobileLayout: (screenWidth) => {
    const current = get().layoutConfig;
    // 사용자가 이미 커스텀한 경우 건드리지 않음
    if (current.nodeWidth && current.nodeWidth !== 200) return;

    let mobileConfig;
    if (screenWidth <= 375) {
      mobileConfig = { nodeWidth: 120, nodeHeight: 50, horizontalGap: 40, verticalGap: 16 };
    } else if (screenWidth <= 480) {
      mobileConfig = { nodeWidth: 140, nodeHeight: 56, horizontalGap: 50, verticalGap: 18 };
    } else if (screenWidth <= 768) {
      mobileConfig = { nodeWidth: 160, nodeHeight: 64, horizontalGap: 60, verticalGap: 20 };
    } else {
      return; // 데스크탑은 변경 없음
    }

    set({ layoutConfig: { ...current, ...mobileConfig } });
  },

  // 전체 레이아웃 재조정
  resetLayout: () => {
    const { mindMapData } = get();
    if (!mindMapData) return;

    get()._pushHistory();

    const defaultConfig = { horizontalGap: 100, verticalGap: 30 };
    const layouted = calculateAutoLayout(mindMapData, defaultConfig);
    if (layouted) {
      set({ mindMapData: layouted, layoutConfig: defaultConfig, error: null });
      get()._saveToStorage(layouted);
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
    if (config.nodeWidth !== undefined) {
      newConfig.nodeWidth = Math.min(300, Math.max(80, config.nodeWidth));
    }
    if (config.nodeHeight !== undefined) {
      newConfig.nodeHeight = Math.min(120, Math.max(30, config.nodeHeight));
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

  // 확대/축소
  zoomIn: () => set((state) => {
    const newZoom = Math.min(state.maxZoom, state.zoomLevel + state.zoomStep);
    return { zoomLevel: newZoom };
  }),

  zoomOut: () => set((state) => {
    const newZoom = Math.max(state.minZoom, state.zoomLevel - state.zoomStep);
    return { zoomLevel: newZoom };
  }),

  setZoomLevel: (level) => set((state) => {
    const clamped = Math.max(state.minZoom, Math.min(state.maxZoom, level));
    return { zoomLevel: clamped };
  }),

  resetZoom: () => set({ zoomLevel: 1.0 }),

  // 활성 문서 ID 설정
  setActiveDocumentId: (docId) => set({ activeDocumentId: docId }),

  // 노드 선택 (다른 노드 선택 시 툴바 닫기)
  setSelectedNodeId: (nodeId) => set((state) => {
    const changes = { selectedNodeId: nodeId };
    if (nodeId !== state.selectedNodeId) {
      changes.toolbarNodeId = null;
    }
    return changes;
  }),

  // 툴바 표시 노드 설정
  setToolbarNodeId: (nodeId) => set({ toolbarNodeId: nodeId }),
  setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),
  setIsNodeDragging: (dragging) => set({ isNodeDragging: dragging }),

  // 초기화
  reset: () => set({
    mindMapData: null,
    loading: false,
    error: null,
    validationErrors: [],
    layoutConfig: { horizontalGap: 100, verticalGap: 30 },
    connectionConfig: {
      style: 'bezier',
      color: '#b0b8c8',
      arrow: false,
      dashed: false,
      thickness: 2,
      inheritColor: false,
      colorMode: 'global'
    },
    viewport: { x: 0, y: 0 },
    zoomLevel: 1.0,
    maxZoom: 3.0,
    minZoom: 0.25,
    zoomStep: 0.25,
    activeDocumentId: null,
    selectedNodeId: null,
    toolbarNodeId: null,
    editingNodeId: null,
    undoStack: [],
    redoStack: [],
    _preDragSnapshot: null
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
