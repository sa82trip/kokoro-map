import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import useMindMapStore from '../src/store/MindMapStore';
import { createRootNode } from '../src/types/NodeTypes';

// 테스트용 스토어 초기화
const { setState } = useMindMapStore;

// Zustand 스토어의 상태를 동기적으로 확인하기 위한 헬퍼
const getStoreState = () => {
  const state = useMindMapStore.getState();
  return state;
};

describe('연결선 고급 스타일 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    setState({
      mindMapData: createRootNode('루트 노드'),
      connectionConfig: {
        style: 'bezier',
        color: '#b0b8c8',
        arrow: false,
        dashed: false,
        thickness: 2,
        inheritColor: false,
        colorMode: 'global'
      }
    });
  });

  test('초기 연결선 설정 확인', () => {
    const store = useMindMapStore.getState();
    expect(store.connectionConfig.style).toBe('bezier');
    expect(store.connectionConfig.color).toBe('#b0b8c8');
    expect(store.connectionConfig.arrow).toBe(false);
    expect(store.connectionConfig.dashed).toBe(false);
    expect(store.connectionConfig.thickness).toBe(2);
    expect(store.connectionConfig.colorMode).toBe('global');
  });

  test('연결선 스타일 변경 - 곡선/직선', () => {
    const store = useMindMapStore.getState();

    // 곡선에서 직선으로 변경
    store.setConnectionConfig({ style: 'straight' });

    // 상태 업데이트가 비동기적이므로 새로운 상태 확인
    const newStore = useMindMapStore.getState();
    expect(newStore.connectionConfig.style).toBe('straight');

    // 직선에서 곡선으로 변경
    store.setConnectionConfig({ style: 'bezier' });
    const finalStore = useMindMapStore.getState();
    expect(finalStore.connectionConfig.style).toBe('bezier');
  });

  test('연결선 색상 변경', () => {
    const store = useMindMapStore.getState();

    // 기본 색상 변경
    store.setConnectionConfig({ color: '#ff0000' });
    expect(useMindMapStore.getState().connectionConfig.color).toBe('#ff0000');

    // 다른 색상 변경
    store.setConnectionConfig({ color: '#00ff00' });
    expect(useMindMapStore.getState().connectionConfig.color).toBe('#00ff00');
  });

  test('화살표 토글', () => {
    const store = useMindMapStore.getState();

    // 화살표 활성화
    store.setConnectionConfig({ arrow: true });
    expect(useMindMapStore.getState().connectionConfig.arrow).toBe(true);

    // 화살표 비활성화
    store.setConnectionConfig({ arrow: false });
    expect(useMindMapStore.getState().connectionConfig.arrow).toBe(false);
  });

  test('점선 스타일 토글', () => {
    const store = useMindMapStore.getState();

    // 점선 활성화
    store.setConnectionConfig({ dashed: true });
    expect(useMindMapStore.getState().connectionConfig.dashed).toBe(true);

    // 점선 비활성화
    store.setConnectionConfig({ dashed: false });
    expect(useMindMapStore.getState().connectionConfig.dashed).toBe(false);
  });

  test('연결선 두께 변경', () => {
    const store = useMindMapStore.getState();

    // 두께 변경
    store.setConnectionConfig({ thickness: 3 });
    expect(useMindMapStore.getState().connectionConfig.thickness).toBe(3);

    // 최대 두께
    store.setConnectionConfig({ thickness: 5 });
    expect(useMindMapStore.getState().connectionConfig.thickness).toBe(5);

    // 최소 두께
    store.setConnectionConfig({ thickness: 1 });
    expect(useMindMapStore.getState().connectionConfig.thickness).toBe(1);
  });

  test('색상 모드 변경 - 전역/브랜치', () => {
    const store = useMindMapStore.getState();

    // 브랜치 모드로 변경
    store.setConnectionConfig({ colorMode: 'branch' });
    expect(useMindMapStore.getState().connectionConfig.colorMode).toBe('branch');

    // 전역 모드로 변경
    store.setConnectionConfig({ colorMode: 'global' });
    expect(useMindMapStore.getState().connectionConfig.colorMode).toBe('global');
  });

  test('색상 상속 설정', () => {
    const store = useMindMapStore.getState();

    // 색상 상속 활성화
    store.setConnectionConfig({ inheritColor: true });
    expect(useMindMapStore.getState().connectionConfig.inheritColor).toBe(true);

    // 색상 상속 비활성화
    store.setConnectionConfig({ inheritColor: false });
    expect(useMindMapStore.getState().connectionConfig.inheritColor).toBe(false);
  });

  test('여러 설정 동시 변경', () => {
    const store = useMindMapStore.getState();

    // 여러 설정을 한 번에 변경
    store.setConnectionConfig({
      style: 'straight',
      color: '#ff0000',
      arrow: true,
      dashed: false,
      thickness: 3
    });

    const state = useMindMapStore.getState();
    expect(state.connectionConfig.style).toBe('straight');
    expect(state.connectionConfig.color).toBe('#ff0000');
    expect(state.connectionConfig.arrow).toBe(true);
    expect(state.connectionConfig.dashed).toBe(false);
    expect(state.connectionConfig.thickness).toBe(3);
  });

  test('자식 노드 추가 후 연결선 생성 확인', () => {
    const store = useMindMapStore.getState();
    const rootNode = store.mindMapData;

    // 자식 노드 추가
    const childNode = {
      id: 'child-1',
      text: '자식 노드',
      position: { x: 100, y: 100 }
    };

    store.addNode(rootNode.id, childNode);

    // 자식 노드가 추가되었는지 확인
    const updatedStore = useMindMapStore.getState();
    expect(updatedStore.mindMapData.children).toHaveLength(1);
    expect(updatedStore.mindMapData.children[0].id).toBe('child-1');
  });
});