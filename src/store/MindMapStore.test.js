import useMindMapStore from './MindMapStore';
import { createRootNode, createChildNode } from '../types/NodeTypes';

// FileManagerStore mock — jest.mock은 호이스팅되므로 변수 참조 불가
jest.mock('./FileManagerStore', () => {
  const mockState = {
    activeDocumentId: 'mock-doc-id',
    initialized: true,
    documents: [{ id: 'mock-doc-id', title: '테스트' }],
    saveActiveDocument: jest.fn(),
    createDocument: jest.fn(() => 'mock-doc-id'),
    loadDocument: jest.fn(),
    initialize: jest.fn()
  };
  return {
    __esModule: true,
    default: {
      getState: () => mockState
    }
  };
});

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('MindMapStore - connectionStyle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMindMapStore.setState({
      mindMapData: null,
      loading: false,
      error: null,
      validationErrors: [],
      connectionStyle: 'bezier',
      activeDocumentId: null,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('기본 연결선 스타일은 bezier이다', () => {
    const state = useMindMapStore.getState();
    expect(state.connectionStyle).toBe('bezier');
  });

  test('연결선 스타일을 straight로 변경할 수 있다', () => {
    useMindMapStore.getState().setConnectionStyle('straight');
    expect(useMindMapStore.getState().connectionStyle).toBe('straight');
  });

  test('연결선 스타일을 bezier로 변경할 수 있다', () => {
    useMindMapStore.getState().setConnectionStyle('straight');
    useMindMapStore.getState().setConnectionStyle('bezier');
    expect(useMindMapStore.getState().connectionStyle).toBe('bezier');
  });

  test('유효하지 않은 스타일은 무시된다', () => {
    useMindMapStore.getState().setConnectionStyle('invalid');
    expect(useMindMapStore.getState().connectionStyle).toBe('bezier');
  });
});

describe('MindMapStore - deleteNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMindMapStore.setState({
      mindMapData: null,
      loading: false,
      error: null,
      validationErrors: [],
      activeDocumentId: null,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('자식 노드를 삭제하면 부모의 children에서 제거된다', () => {
    const root = createRootNode('루트');
    const child = createChildNode('root', '자식1', root.color);
    child.position = { x: 300, y: 200 };

    root.children = [child];

    useMindMapStore.getState().setMindMapData(root);
    useMindMapStore.getState().deleteNode(child.id);

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children).toEqual([]);
    expect(state.error).toBeNull();
  });

  test('자식 노드 삭제 시 모든 하위 노드도 함께 삭제된다', () => {
    const root = createRootNode('루트');
    const child = createChildNode('root', '자식1', root.color);
    const grandchild = createChildNode(child.id, '손자1', child.color);
    child.position = { x: 300, y: 200 };
    grandchild.position = { x: 550, y: 200 };
    child.children = [grandchild];

    root.children = [child];

    useMindMapStore.getState().setMindMapData(root);
    useMindMapStore.getState().deleteNode(child.id);

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children).toEqual([]);
    // 손자 노드도 함께 삭제됨 (자식 자체가 사라졌으므로)
  });

  test('루트 노드는 삭제할 수 없다', () => {
    const root = createRootNode('루트');

    useMindMapStore.getState().setMindMapData(root);
    useMindMapStore.getState().deleteNode('root');

    const state = useMindMapStore.getState();
    expect(state.error).toBe('루트 노드를 삭제할 수 없습니다');
    expect(state.mindMapData).not.toBeNull();
  });

  test('여러 자식 중 하나만 삭제하면 나머지는 유지된다', () => {
    const root = createRootNode('루트');
    const child1 = createChildNode('root', '자식1', root.color);
    const child2 = createChildNode('root', '자식2', root.color);
    const child3 = createChildNode('root', '자식3', root.color);
    child1.position = { x: 300, y: 100 };
    child2.position = { x: 300, y: 200 };
    child3.position = { x: 300, y: 300 };

    root.children = [child1, child2, child3];

    useMindMapStore.getState().setMindMapData(root);
    useMindMapStore.getState().deleteNode(child2.id);

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children).toHaveLength(2);
    expect(state.mindMapData.children.map(c => c.id)).toEqual(
      expect.arrayContaining([child1.id, child3.id])
    );
    expect(state.mindMapData.children.find(c => c.id === child2.id)).toBeUndefined();
  });

  test('mindMapData가 null이면 삭제가 무시된다', () => {
    useMindMapStore.getState().deleteNode('some-id');

    const state = useMindMapStore.getState();
    expect(state.mindMapData).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe('MindMapStore - layoutConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMindMapStore.setState({
      mindMapData: null,
      loading: false,
      error: null,
      validationErrors: [],
      layoutConfig: { horizontalGap: 100, verticalGap: 30 },
      activeDocumentId: null,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('기본 레이아웃 설정은 horizontalGap 100, verticalGap 30이다', () => {
    const state = useMindMapStore.getState();
    expect(state.layoutConfig).toEqual({ horizontalGap: 100, verticalGap: 30 });
  });

  test('레이아웃 설정을 변경할 수 있다', () => {
    useMindMapStore.getState().setLayoutConfig({ horizontalGap: 200, verticalGap: 60 });
    expect(useMindMapStore.getState().layoutConfig).toEqual({ horizontalGap: 200, verticalGap: 60 });
  });

  test('gap 값은 최소 20이어야 한다', () => {
    useMindMapStore.getState().setLayoutConfig({ horizontalGap: 10, verticalGap: 10 });
    expect(useMindMapStore.getState().layoutConfig.horizontalGap).toBe(20);
    expect(useMindMapStore.getState().layoutConfig.verticalGap).toBe(20);
  });

  test('gap 값은 최대 500이어야 한다', () => {
    useMindMapStore.getState().setLayoutConfig({ horizontalGap: 600, verticalGap: 600 });
    expect(useMindMapStore.getState().layoutConfig.horizontalGap).toBe(500);
    expect(useMindMapStore.getState().layoutConfig.verticalGap).toBe(500);
  });

  test('부분 업데이트가 가능하다', () => {
    useMindMapStore.getState().setLayoutConfig({ horizontalGap: 150 });
    const state = useMindMapStore.getState();
    expect(state.layoutConfig.horizontalGap).toBe(150);
    expect(state.layoutConfig.verticalGap).toBe(30);
  });
});

describe('MindMapStore - backgroundColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const root = createRootNode('루트');
    useMindMapStore.setState({
      mindMapData: root,
      loading: false,
      error: null,
      validationErrors: [],
      activeDocumentId: 'mock-doc-id',
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('노드 배경색을 업데이트할 수 있다', () => {
    useMindMapStore.getState().updateNodeStyle('root', { backgroundColor: '#FF0000' });
    const state = useMindMapStore.getState();
    expect(state.mindMapData.style.backgroundColor).toBe('#FF0000');
  });

  test('유효하지 않은 배경색은 무시된다', () => {
    useMindMapStore.getState().updateNodeStyle('root', { backgroundColor: 'invalid' });
    const state = useMindMapStore.getState();
    expect(state.mindMapData.style.backgroundColor).toBeUndefined();
  });
});

describe('MindMapStore - connectionColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMindMapStore.setState({
      mindMapData: null,
      loading: false,
      error: null,
      validationErrors: [],
      connectionColor: '#b0b8c8',
      activeDocumentId: null,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('기본 연결선 색상은 #b0b8c8이다', () => {
    expect(useMindMapStore.getState().connectionColor).toBe('#b0b8c8');
  });

  test('연결선 색상을 변경할 수 있다', () => {
    useMindMapStore.getState().setConnectionColor('#FF0000');
    expect(useMindMapStore.getState().connectionColor).toBe('#FF0000');
  });

  test('유효하지 않은 색상은 무시된다', () => {
    useMindMapStore.getState().setConnectionColor('invalid');
    expect(useMindMapStore.getState().connectionColor).toBe('#b0b8c8');
  });
});

describe('MindMapStore - resetLayout', () => {
  test('resetLayout이 전체 노드 위치를 재계산한다', () => {
    const root = createRootNode('루트');
    const child = createChildNode('root', '자식', root.color);
    child.position = { x: 0, y: 0 };
    root.children = [child];

    useMindMapStore.setState({ mindMapData: root, error: null });
    useMindMapStore.getState().resetLayout();

    const state = useMindMapStore.getState();
    expect(state.error).toBeNull();
    expect(state.mindMapData.children[0].position.x).toBeGreaterThan(0);
  });
});

describe('MindMapStore - viewport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMindMapStore.setState({
      viewport: { x: 0, y: 0 },
      activeDocumentId: null,
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('초기 viewport는 { x: 0, y: 0 }이다', () => {
    expect(useMindMapStore.getState().viewport).toEqual({ x: 0, y: 0 });
  });

  test('panViewport로 viewport를 델타 이동할 수 있다', () => {
    useMindMapStore.getState().panViewport(50, -30);
    expect(useMindMapStore.getState().viewport).toEqual({ x: 50, y: -30 });
  });

  test('setViewport로 절대 위치를 설정할 수 있다', () => {
    useMindMapStore.getState().setViewport({ x: 200, y: 100 });
    expect(useMindMapStore.getState().viewport).toEqual({ x: 200, y: 100 });
  });

  test('resetViewport로 원점으로 복귀한다', () => {
    useMindMapStore.getState().setViewport({ x: 200, y: 100 });
    useMindMapStore.getState().resetViewport();
    expect(useMindMapStore.getState().viewport).toEqual({ x: 0, y: 0 });
  });

  test('누적 패닝이 정확히 계산된다', () => {
    useMindMapStore.getState().panViewport(10, 20);
    useMindMapStore.getState().panViewport(-5, 10);
    expect(useMindMapStore.getState().viewport).toEqual({ x: 5, y: 30 });
  });

  test('reset 액션에 viewport 초기화가 포함된다', () => {
    useMindMapStore.getState().setViewport({ x: 200, y: 100 });
    useMindMapStore.getState().reset();
    expect(useMindMapStore.getState().viewport).toEqual({ x: 0, y: 0 });
  });
});

describe('MindMapStore - Undo/Redo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const root = createRootNode('루트');
    useMindMapStore.setState({
      mindMapData: root,
      loading: false,
      error: null,
      validationErrors: [],
      activeDocumentId: 'mock-doc-id',
      undoStack: [],
      redoStack: [],
      _preDragSnapshot: null
    });
  });

  test('초기 상태에서 undo/redo가 불가능하다', () => {
    expect(useMindMapStore.getState().canUndo()).toBe(false);
    expect(useMindMapStore.getState().canRedo()).toBe(false);
  });

  test('노드 추가 후 undo로 되돌릴 수 있다', () => {
    const root = useMindMapStore.getState().mindMapData;
    expect(root.children).toHaveLength(0);

    const child = createChildNode('root', '자식1', root.color);
    child.position = { x: 300, y: 200 };
    useMindMapStore.getState().addNode('root', child);

    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(1);
    expect(useMindMapStore.getState().canUndo()).toBe(true);

    useMindMapStore.getState().undo();

    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(0);
    expect(useMindMapStore.getState().canUndo()).toBe(false);
    expect(useMindMapStore.getState().canRedo()).toBe(true);
  });

  test('undo 후 redo로 다시 복원할 수 있다', () => {
    const root = useMindMapStore.getState().mindMapData;
    const child = createChildNode('root', '자식1', root.color);
    child.position = { x: 300, y: 200 };
    useMindMapStore.getState().addNode('root', child);

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(0);

    useMindMapStore.getState().redo();
    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(1);
    expect(useMindMapStore.getState().mindMapData.children[0].text).toBe('자식1');
  });

  test('노드 삭제 후 undo로 복원할 수 있다', () => {
    const root = useMindMapStore.getState().mindMapData;
    const child = createChildNode('root', '자식1', root.color);
    child.position = { x: 300, y: 200 };
    root.children = [child];
    useMindMapStore.setState({ mindMapData: root, undoStack: [], redoStack: [] });

    useMindMapStore.getState().deleteNode(child.id);
    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(0);

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(1);
    expect(useMindMapStore.getState().mindMapData.children[0].text).toBe('자식1');
  });

  test('노드 텍스트 변경 후 undo로 복원할 수 있다', () => {
    const root = useMindMapStore.getState().mindMapData;
    const originalText = root.text;

    useMindMapStore.getState().updateNodeText('root', '변경된 텍스트');
    expect(useMindMapStore.getState().mindMapData.text).toBe('변경된 텍스트');

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.text).toBe(originalText);
  });

  test('노드 스타일 변경 후 undo로 복원할 수 있다', () => {
    useMindMapStore.getState().updateNodeStyle('root', { fontSize: 24 });
    expect(useMindMapStore.getState().mindMapData.style.fontSize).toBe(24);

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.style.fontSize).toBe(16);
  });

  test('제목 변경 후 undo로 복원할 수 있다', () => {
    useMindMapStore.getState().updateMindMapTitle('새 제목');
    expect(useMindMapStore.getState().mindMapData.text).toBe('새 제목');

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.text).toBe('루트');
  });

  test('새 변경이 있으면 redo 스택이 초기화된다', () => {
    const root = useMindMapStore.getState().mindMapData;
    const child = createChildNode('root', '자식1', root.color);
    child.position = { x: 300, y: 200 };
    useMindMapStore.getState().addNode('root', child);

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().canRedo()).toBe(true);

    // 새로운 변경
    const child2 = createChildNode('root', '자식2', root.color);
    child2.position = { x: 300, y: 200 };
    useMindMapStore.getState().addNode('root', child2);

    expect(useMindMapStore.getState().canRedo()).toBe(false);
    expect(useMindMapStore.getState().mindMapData.children).toHaveLength(1);
    expect(useMindMapStore.getState().mindMapData.children[0].text).toBe('자식2');
  });

  test('다중 undo/redo가 정확하게 동작한다', () => {
    const root = useMindMapStore.getState().mindMapData;

    // 3번 변경
    useMindMapStore.getState().updateNodeText('root', '변경1');
    useMindMapStore.getState().updateNodeText('root', '변경2');
    useMindMapStore.getState().updateNodeText('root', '변경3');
    expect(useMindMapStore.getState().mindMapData.text).toBe('변경3');

    // 2번 undo
    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.text).toBe('변경2');
    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.text).toBe('변경1');

    // 1번 redo
    useMindMapStore.getState().redo();
    expect(useMindMapStore.getState().mindMapData.text).toBe('변경2');
  });

  test('빈 undoStack에서 undo는 아무 동작하지 않는다', () => {
    const originalText = useMindMapStore.getState().mindMapData.text;
    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.text).toBe(originalText);
  });

  test('빈 redoStack에서 redo는 아무 동작하지 않는다', () => {
    const originalText = useMindMapStore.getState().mindMapData.text;
    useMindMapStore.getState().redo();
    expect(useMindMapStore.getState().mindMapData.text).toBe(originalText);
  });

  test('clearHistory가 undo/redo 스택을 초기화한다', () => {
    useMindMapStore.getState().updateNodeText('root', '변경');
    expect(useMindMapStore.getState().canUndo()).toBe(true);

    useMindMapStore.getState().clearHistory();
    expect(useMindMapStore.getState().undoStack).toHaveLength(0);
    expect(useMindMapStore.getState().redoStack).toHaveLength(0);
    expect(useMindMapStore.getState().canUndo()).toBe(false);
  });

  test('드래그 후 saveNodePositions이 히스토리에 저장된다', () => {
    const root = useMindMapStore.getState().mindMapData;
    const originalPos = { ...root.position };

    useMindMapStore.getState().updateNodePosition('root', { x: 500, y: 300 });
    useMindMapStore.getState().saveNodePositions();

    expect(useMindMapStore.getState().mindMapData.position.x).toBe(500);
    expect(useMindMapStore.getState().canUndo()).toBe(true);

    useMindMapStore.getState().undo();
    expect(useMindMapStore.getState().mindMapData.position).toEqual(originalPos);
  });

  test('reset 액션에 undo/redo 초기화가 포함된다', () => {
    useMindMapStore.getState().updateNodeText('root', '변경');
    expect(useMindMapStore.getState().canUndo()).toBe(true);

    useMindMapStore.getState().reset();
    expect(useMindMapStore.getState().undoStack).toHaveLength(0);
    expect(useMindMapStore.getState().redoStack).toHaveLength(0);
  });
});
