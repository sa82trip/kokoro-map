import useMindMapStore from './MindMapStore';
import { createRootNode, createChildNode } from '../types/NodeTypes';

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

describe('MindMapStore - deleteNode', () => {
  beforeEach(() => {
    // 스토어 초기화
    useMindMapStore.setState({
      mindMapData: null,
      loading: false,
      error: null,
      validationErrors: []
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
