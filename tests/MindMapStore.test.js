import { renderHook, act } from '@testing-library/react';
import useMindMapStore from '../src/store/MindMapStore';
import { createRootNode } from '../src/types/NodeTypes';
import { validateNode, validateMindMap } from '../src/utils/NodeValidator';

// Mock window 객체
Object.defineProperty(window, 'innerWidth', {
  value: 1920,
  writable: true
});
Object.defineProperty(window, 'innerHeight', {
  value: 1080,
  writable: true
});

describe('MindMapStore', () => {
  const mockRootNode = createRootNode('테스트 마인드맵');
  // createRootNode creates id: 'root'

  beforeEach(() => {
    // 테스트마다 스토어 초기화
    const { result } = renderHook(() => useMindMapStore());
    act(() => {
      result.current.reset();
    });
  });

  test('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    expect(result.current.mindMapData).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.validationErrors).toEqual([]);
  });

  test('데이터 설정 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    expect(result.current.mindMapData).toEqual(mockRootNode);
    expect(result.current.error).toBeNull();
  });

  test('유효하지 않은 데이터 설정 시 에러가 발생해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData({
        id: '',
        text: '',
        position: { x: 0, y: 0 },
        isRoot: true
      });
    });

    expect(result.current.error).toContain('데이터 유효성 검증 실패');
    expect(result.current.mindMapData).toBeNull();
  });

  test('노드 텍스트 업데이트 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    // 데이터 설정
    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    // 텍스트 업데이트 - id는 'root'
    act(() => {
      result.current.updateNodeText('root', '업데이트된 텍스트');
    });

    expect(result.current.mindMapData.text).toBe('업데이트된 텍스트');
    expect(result.current.error).toBeNull();
  });

  test('유효하지 않은 텍스트 업데이트 시 에러가 발생해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    // 데이터 설정
    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    // 유효하지 않은 텍스트 업데이트
    act(() => {
      result.current.updateNodeText('root', '');
    });

    expect(result.current.error).toContain('텍스트가 필요합니다');
    expect(result.current.mindMapData.text).toBe('테스트 마인드맵'); // 원본 유지
  });

  test('노드 위치 업데이트 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    const newPosition = { x: 500, y: 300 };

    act(() => {
      result.current.updateNodePosition('root', newPosition);
    });

    expect(result.current.mindMapData.position).toEqual(newPosition);
  });

  test('유효하지 않은 위치 업데이트 시 에러가 발생해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    const invalidPosition = { x: 'invalid', y: 300 };

    act(() => {
      result.current.updateNodePosition('root', invalidPosition);
    });

    expect(result.current.error).toContain('유효하지 않은 위치입니다');
  });

  test('노드 추가 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    const childNode = {
      id: 'child-1',
      text: '자식 노드',
      color: '#52c41a',
      position: { x: 300, y: 200 },
      children: [],
      isRoot: false
    };

    act(() => {
      result.current.addNode('root', childNode);
    });

    expect(result.current.mindMapData.children).toHaveLength(1);
    expect(result.current.mindMapData.children[0]).toEqual(childNode);
  });

  test('최대 노드 수 제한이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    // 유효성 검사(자식 50개 제한)를 통과하면서 총 1000개가 넘는 트리 구성
    // 루트(1) + 루트 자식 20개(20) + 각 자식마다 자식 50개(1000) = 총 1021개
    const largeMindMap = {
      ...mockRootNode,
      children: []
    };

    for (let i = 0; i < 20; i++) {
      const branch = {
        id: `branch-${i}`,
        text: `Branch ${i}`,
        color: '#52c41a',
        position: { x: i * 100, y: i * 100 },
        children: [],
        isRoot: false
      };
      for (let j = 0; j < 50; j++) {
        branch.children.push({
          id: `leaf-${i}-${j}`,
          text: `Leaf ${i}-${j}`,
          color: '#3498DB',
          position: { x: i * 100 + j * 10, y: i * 100 + j * 10 },
          children: [],
          isRoot: false
        });
      }
      largeMindMap.children.push(branch);
    }

    act(() => {
      result.current.setMindMapData(largeMindMap);
    });

    // 추가 노드 시도
    const newNode = {
      id: 'overflow-node',
      text: 'Overflow Node',
      color: '#52c41a',
      position: { x: 1000, y: 1000 },
      children: [],
      isRoot: false
    };

    act(() => {
      result.current.addNode('root', newNode);
    });

    expect(result.current.error).toContain('노드 수가 최대 한도를 초과');
  });

  test('루트 노드 삭제 시 에러가 발생해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setMindMapData(mockRootNode);
    });

    act(() => {
      result.current.deleteNode('root');
    });

    expect(result.current.error).toContain('루트 노드를 삭제할 수 없습니다');
    expect(result.current.mindMapData).not.toBeNull();
  });

  test('자식 노드 삭제 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    // 자식 노드가 있는 마인드맵 생성
    const mindMapWithChildren = {
      ...mockRootNode,
      children: [
        {
          id: 'child-1',
          text: 'Child 1',
          color: '#52c41a',
          position: { x: 300, y: 200 },
          children: [
            {
              id: 'grandchild-1',
              text: 'Grandchild 1',
              color: '#faad14',
              position: { x: 400, y: 300 },
              children: [],
              isRoot: false
            }
          ],
          isRoot: false
        }
      ]
    };

    act(() => {
      result.current.setMindMapData(mindMapWithChildren);
    });

    act(() => {
      result.current.deleteNode('child-1');
    });

    expect(result.current.mindMapData.children).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  test('로딩 상태 설정 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });

  test('에러 설정 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    const errorMessage = '테스트 에러';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  test('스토어 초기화 기능이 동작해야 합니다', () => {
    const { result } = renderHook(() => useMindMapStore());

    // 데이터 설정
    act(() => {
      result.current.setMindMapData(mockRootNode);
      result.current.setError('테스트 에러');
    });

    // 초기화
    act(() => {
      result.current.reset();
    });

    expect(result.current.mindMapData).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.validationErrors).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

describe('validateNode 유틸리티 함수', () => {
  test('유효한 노드 검증 성공', () => {
    const validNode = {
      id: 'test-node',
      text: '테스트 노드',
      color: '#4A90E2',
      position: { x: 100, y: 200 },
      children: [],
      isRoot: false
    };

    const result = validateNode(validNode);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('필수 필드 누락 시 검증 실패', () => {
    const invalidNode = {
      text: '테스트 노드',
      position: { x: 100, y: 200 }
    };

    const result = validateNode(invalidNode);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('ID가 필요합니다');
  });

  test('텍스트 길이 제한 초과 시 검증 실패', () => {
    const longText = 'a'.repeat(201);
    const invalidNode = {
      id: 'test-node',
      text: longText,
      color: '#4A90E2',
      position: { x: 100, y: 200 },
      children: [],
      isRoot: false
    };

    const result = validateNode(invalidNode);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('텍스트가 너무 깁니다')])
    );
  });

  test('색상 형식이 올바르지 않을 시 검증 실패', () => {
    const invalidNode = {
      id: 'test-node',
      text: '테스트 노드',
      color: 'invalid-color',
      position: { x: 100, y: 200 },
      children: [],
      isRoot: false
    };

    const result = validateNode(invalidNode);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('색상 형식이 올바르지 않습니다')])
    );
  });
});

describe('validateMindMap 유틸리티 함수', () => {
  test('유효한 마인드맵 검증 성공', () => {
    const validMindMap = {
      id: 'root',
      text: '루트 노드',
      color: '#4A90E2',
      position: { x: 100, y: 100 },
      children: [
        {
          id: 'child-1',
          text: '자식 노드',
          color: '#52c41a',
          position: { x: 300, y: 200 },
          children: [],
          isRoot: false
        }
      ],
      isRoot: true
    };

    const result = validateMindMap(validMindMap);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('하나의 노드가 유효하지 않을 시 전체 검증 실패', () => {
    const invalidMindMap = {
      id: 'root',
      text: '루트 노드',
      color: '#4A90E2',
      position: { x: 100, y: 100 },
      children: [
        {
          id: 'child-1',
          text: '', // 유효하지 않은 텍스트
          color: '#52c41a',
          position: { x: 300, y: 200 },
          children: [],
          isRoot: false
        }
      ],
      isRoot: true
    };

    const result = validateMindMap(invalidMindMap);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].errors).toContain('텍스트가 필요합니다');
  });
});
