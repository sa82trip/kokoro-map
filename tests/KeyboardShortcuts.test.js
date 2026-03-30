import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import useKeyboardShortcuts from '../src/hooks/useKeyboardShortcuts';
import useMindMapStore from '../src/store/MindMapStore';
import { createRootNode, createChildNode } from '../src/types/NodeTypes';
import KeyboardShortcutsHelp from '../src/components/MindMap/KeyboardShortcutsHelp';

// FileManagerStore mock
jest.mock('../src/store/FileManagerStore', () => {
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

// TextMeasurer mock
jest.mock('../src/utils/TextMeasurer', () => ({
  measureText: jest.fn(() => ({ width: 100, height: 40 }))
}));

// LayoutEngine mock
jest.mock('../src/utils/LayoutEngine', () => ({
  calculateAutoLayout: jest.fn((node) => node),
  calculateNewChildPosition: jest.fn(() => ({ x: 300, y: 200 }))
}));

describe('useKeyboardShortcuts', () => {
  let mockData;

  beforeEach(() => {
    const { result } = renderHook(() => useMindMapStore());
    act(() => { result.current.reset(); });

    mockData = {
      ...createRootNode('테스트 마인드맵'),
      children: [
        {
          id: 'child-1',
          text: '자식 1',
          color: '#52c41a',
          position: { x: 300, y: 100 },
          children: [
            {
              id: 'grandchild-1',
              text: '손자 1',
              color: '#faad14',
              position: { x: 500, y: 80 },
              children: [],
              isRoot: false
            }
          ],
          isRoot: false
        },
        {
          id: 'child-2',
          text: '자식 2',
          color: '#52c41a',
          position: { x: 300, y: 200 },
          children: [],
          isRoot: false
        }
      ]
    };

    act(() => { result.current.setMindMapData(mockData); });
  });

  const createKeyboardEvent = (key, options = {}) => {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ...options
    });
  };

  test('Escape 키로 노드 선택 해제', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Escape'));
    });

    expect(useMindMapStore.getState().selectedNodeId).toBeNull();
  });

  test('Delete 키로 선택된 노드 삭제', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Delete'));
    });

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children.find(c => c.id === 'child-1')).toBeUndefined();
    expect(state.selectedNodeId).toBeNull();
  });

  test('Backspace 키로 선택된 노드 삭제', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-2');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Backspace'));
    });

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children.find(c => c.id === 'child-2')).toBeUndefined();
  });

  test('루트 노드는 Delete로 삭제 불가', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('root');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Delete'));
    });

    expect(useMindMapStore.getState().mindMapData).not.toBeNull();
    expect(useMindMapStore.getState().mindMapData.id).toBe('root');
  });

  test('Enter 키로 자식 노드 추가', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Enter'));
    });

    const state = useMindMapStore.getState();
    const child1 = state.mindMapData.children.find(c => c.id === 'child-1');
    expect(child1.children.length).toBe(2); // 기존 grandchild-1 + 새 노드
  });

  test('Tab 키로 형제 노드 추가', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    const prevCount = useMindMapStore.getState().mindMapData.children.length;

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Tab'));
    });

    const state = useMindMapStore.getState();
    expect(state.mindMapData.children.length).toBe(prevCount + 1);
  });

  test('ArrowRight: 첫 번째 자식으로 이동', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('root');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('ArrowRight'));
    });

    expect(useMindMapStore.getState().selectedNodeId).toBe('child-1');
  });

  test('ArrowLeft: 부모로 이동', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('ArrowLeft'));
    });

    expect(useMindMapStore.getState().selectedNodeId).toBe('root');
  });

  test('ArrowDown: 다음 형제로 이동', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('ArrowDown'));
    });

    expect(useMindMapStore.getState().selectedNodeId).toBe('child-2');
  });

  test('ArrowUp: 이전 형제로 이동', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-2');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('ArrowUp'));
    });

    expect(useMindMapStore.getState().selectedNodeId).toBe('child-1');
  });

  test('ArrowUp 첫 번째 자식이면 부모 반환', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('ArrowUp'));
    });

    // child-1이 첫 번째 자식이므로 부모(root) 반환
    expect(useMindMapStore.getState().selectedNodeId).toBe('root');
  });

  test('입력 필드에서는 단축키 무시', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    const inputEvent = createKeyboardEvent('Delete');
    Object.defineProperty(inputEvent, 'target', {
      value: document.createElement('input')
    });

    act(() => {
      window.dispatchEvent(inputEvent);
    });

    // 노드가 삭제되지 않아야 함
    expect(useMindMapStore.getState().mindMapData.children.find(c => c.id === 'child-1')).toBeDefined();
  });

  test('contentEditable 요소에서는 단축키 무시', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true });
    const editableEvent = createKeyboardEvent('Delete');
    Object.defineProperty(editableEvent, 'target', { value: div });

    act(() => {
      window.dispatchEvent(editableEvent);
    });

    expect(useMindMapStore.getState().mindMapData.children.find(c => c.id === 'child-1')).toBeDefined();
  });

  test('Ctrl+S로 저장 호출', () => {
    const fm = require('../src/store/FileManagerStore').default;

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('s', { ctrlKey: true }));
    });

    expect(fm.getState().saveActiveDocument).toHaveBeenCalled();
  });

  test('Cmd+S(Mac)로 저장 호출', () => {
    const fm = require('../src/store/FileManagerStore').default;

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('s', { metaKey: true }));
    });

    expect(fm.getState().saveActiveDocument).toHaveBeenCalled();
  });

  test('? 키로 도움말 토글', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current.showHelp).toBe(false);

    act(() => {
      window.dispatchEvent(createKeyboardEvent('?'));
    });

    expect(result.current.showHelp).toBe(true);
  });

  test('도움말 열린 상태에서 Escape로 닫기', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('?'));
    });

    expect(result.current.showHelp).toBe(true);

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Escape'));
    });

    expect(result.current.showHelp).toBe(false);
  });

  test('선택된 노드가 없으면 조작 단축키 무시', () => {
    const store = useMindMapStore.getState();
    store.setSelectedNodeId(null);

    renderHook(() => useKeyboardShortcuts());

    const prevChildrenCount = useMindMapStore.getState().mindMapData.children.length;

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Delete'));
    });

    expect(useMindMapStore.getState().mindMapData.children.length).toBe(prevChildrenCount);
  });

  test('Shift+/ (?) 키로 도움말 토글', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('/', { shiftKey: true }));
    });

    expect(result.current.showHelp).toBe(true);
  });
});

describe('버그 재현: 키보드로 노드 추가 시 calculateNewChildPosition 호출 방식', () => {
  let mockData;

  beforeEach(() => {
    const { result } = renderHook(() => useMindMapStore());
    act(() => { result.current.reset(); });

    mockData = {
      ...createRootNode('테스트 마인드맵'),
      children: [
        {
          id: 'child-1',
          text: '자식 1',
          color: '#52c41a',
          position: { x: 300, y: 100 },
          children: [],
          isRoot: false
        }
      ]
    };

    act(() => { result.current.setMindMapData(mockData); });
  });

  const createKeyboardEvent = (key, options = {}) => {
    return new KeyboardEvent('keydown', { key, bubbles: true, ...options });
  };

  test('Enter 키: calculateNewChildPosition이 부모 position 객체와 자식 수로 호출되어야 함', () => {
    const { calculateNewChildPosition } = require('../src/utils/LayoutEngine');
    calculateNewChildPosition.mockClear();

    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Enter'));
    });

    // calculateNewChildPosition이 (position{x,y}, number)로 호출되었는지 확인
    expect(calculateNewChildPosition).toHaveBeenCalled();
    const callArgs = calculateNewChildPosition.mock.calls[0];

    // 첫 번째 인자는 반드시 position 객체 {x, y}여야 함 (노드 객체가 아님)
    const firstArg = callArgs[0];
    expect(typeof firstArg.x).toBe('number');
    expect(typeof firstArg.y).toBe('number');
    expect(firstArg.x).not.toBeNaN();
    expect(firstArg.y).not.toBeNaN();

    // 두 번째 인자는 자식 수 (number)
    const secondArg = callArgs[1];
    expect(typeof secondArg).toBe('number');
  });

  test('Tab 키: calculateNewChildPosition이 부모 position 객체와 자식 수로 호출되어야 함', () => {
    const { calculateNewChildPosition } = require('../src/utils/LayoutEngine');
    calculateNewChildPosition.mockClear();

    const store = useMindMapStore.getState();
    store.setSelectedNodeId('child-1');

    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(createKeyboardEvent('Tab'));
    });

    expect(calculateNewChildPosition).toHaveBeenCalled();
    const callArgs = calculateNewChildPosition.mock.calls[0];

    const firstArg = callArgs[0];
    expect(typeof firstArg.x).toBe('number');
    expect(typeof firstArg.y).toBe('number');
    expect(firstArg.x).not.toBeNaN();
    expect(firstArg.y).not.toBeNaN();

    const secondArg = callArgs[1];
    expect(typeof secondArg).toBe('number');
  });
});

describe('KeyboardShortcutsHelp', () => {
  test('렌더링 및 닫기 버튼 동작', () => {
    const onClose = jest.fn();
    render(<KeyboardShortcutsHelp onClose={onClose} />);

    expect(screen.getByTestId('shortcuts-help')).toBeInTheDocument();
    expect(screen.getByText('키보드 단축키')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('shortcuts-help-close'));
    expect(onClose).toHaveBeenCalled();
  });

  test('오버레이 클릭으로 닫기', () => {
    const onClose = jest.fn();
    render(<KeyboardShortcutsHelp onClose={onClose} />);

    fireEvent.click(screen.getByTestId('shortcuts-help'));
    expect(onClose).toHaveBeenCalled();
  });

  test('모든 단축키 그룹 렌더링', () => {
    render(<KeyboardShortcutsHelp onClose={jest.fn()} />);

    expect(screen.getByText('노드 조작')).toBeInTheDocument();
    expect(screen.getByText('노드 탐색')).toBeInTheDocument();
    expect(screen.getByText('일반')).toBeInTheDocument();
  });

  test('단축키 설명 표시', () => {
    render(<KeyboardShortcutsHelp onClose={jest.fn()} />);

    expect(screen.getByText('자식 노드 추가')).toBeInTheDocument();
    expect(screen.getByText('형제 노드 추가')).toBeInTheDocument();
    expect(screen.getByText('저장')).toBeInTheDocument();
    expect(screen.getByText('실행 취소')).toBeInTheDocument();
    expect(screen.getByText('다시 실행')).toBeInTheDocument();
    expect(screen.getByText('단축키 도움말')).toBeInTheDocument();
    expect(screen.getByText('선택된 노드 삭제')).toBeInTheDocument();
    expect(screen.getByText('선택 해제')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 자식으로 이동')).toBeInTheDocument();
    expect(screen.getByText('부모 노드로 이동')).toBeInTheDocument();
    expect(screen.getByText('이전 형제로 이동')).toBeInTheDocument();
    expect(screen.getByText('다음 형제로 이동')).toBeInTheDocument();
  });
});

describe('selectedNodeId 스토어 동기화', () => {
  test('스토어의 setSelectedNodeId가 상태를 업데이트', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(createRootNode('테스트'));
    });

    act(() => {
      result.current.setSelectedNodeId('test-id');
    });

    expect(result.current.selectedNodeId).toBe('test-id');
  });

  test('reset이 selectedNodeId를 초기화', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setSelectedNodeId('test-id');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.selectedNodeId).toBeNull();
  });
});
