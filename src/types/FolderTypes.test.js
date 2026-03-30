import {
  MAX_FOLDER_DEPTH,
  createFolder,
  updateFolder,
  validateFolder,
  getFolderDepth
} from './FolderTypes';

describe('FolderTypes', () => {
  describe('MAX_FOLDER_DEPTH', () => {
    test('최대 깊이는 3이다', () => {
      expect(MAX_FOLDER_DEPTH).toBe(3);
    });
  });

  describe('createFolder', () => {
    test('기본값으로 폴더를 생성한다', () => {
      const folder = createFolder('테스트 폴더');
      expect(folder.id).toBeDefined();
      expect(typeof folder.id).toBe('string');
      expect(folder.name).toBe('테스트 폴더');
      expect(folder.parentId).toBeNull();
      expect(folder.createdAt).toBeDefined();
      expect(folder.order).toBe(0);
    });

    test('parentId와 함께 폴더를 생성한다', () => {
      const folder = createFolder('하위 폴더', 'parent-123');
      expect(folder.name).toBe('하위 폴더');
      expect(folder.parentId).toBe('parent-123');
    });

    test('ID가 매번 다르게 생성된다', () => {
      const folder1 = createFolder('폴더1');
      const folder2 = createFolder('폴더2');
      expect(folder1.id).not.toBe(folder2.id);
    });
  });

  describe('updateFolder', () => {
    test('폴더 속성을 갱신한다', () => {
      const folder = createFolder('원래 이름');
      const updated = updateFolder(folder, { name: '변경된 이름' });
      expect(updated.name).toBe('변경된 이름');
    });

    test('원본 폴더를 변경하지 않는다', () => {
      const folder = createFolder('원래 이름');
      updateFolder(folder, { name: '변경된 이름' });
      expect(folder.name).toBe('원래 이름');
    });

    test('일부 속성만 갱신해도 나머지는 유지된다', () => {
      const folder = createFolder('테스트');
      const updated = updateFolder(folder, { order: 5 });
      expect(updated.order).toBe(5);
      expect(updated.name).toBe('테스트');
      expect(updated.id).toBe(folder.id);
    });
  });

  describe('validateFolder', () => {
    test('유효한 폴더는 검증을 통과한다', () => {
      const folder = createFolder('유효한 폴더');
      const result = validateFolder(folder);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('null 입력 시 검증 실패한다', () => {
      const result = validateFolder(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('폴더 데이터가 없습니다');
    });

    test('id가 없으면 검증 실패한다', () => {
      const folder = createFolder('테스트');
      delete folder.id;
      const result = validateFolder(folder);
      expect(result.isValid).toBe(false);
    });

    test('name이 없으면 검증 실패한다', () => {
      const folder = createFolder('테스트');
      folder.name = '';
      const result = validateFolder(folder);
      expect(result.isValid).toBe(false);
    });

    test('createdAt이 없으면 검증 실패한다', () => {
      const folder = createFolder('테스트');
      delete folder.createdAt;
      const result = validateFolder(folder);
      expect(result.isValid).toBe(false);
    });

    test('order가 음수면 검증 실패한다', () => {
      const folder = createFolder('테스트');
      folder.order = -1;
      const result = validateFolder(folder);
      expect(result.isValid).toBe(false);
    });
  });

  describe('getFolderDepth', () => {
    const folders = [
      { id: 'A', name: 'A', parentId: null, createdAt: '2026-01-01T00:00:00Z', order: 0 },
      { id: 'B', name: 'B', parentId: 'A', createdAt: '2026-01-01T00:00:00Z', order: 0 },
      { id: 'C', name: 'C', parentId: 'B', createdAt: '2026-01-01T00:00:00Z', order: 0 },
      { id: 'D', name: 'D', parentId: 'C', createdAt: '2026-01-01T00:00:00Z', order: 0 }
    ];

    test('루트 폴더의 깊이는 0이다', () => {
      expect(getFolderDepth('A', folders)).toBe(0);
    });

    test('1단계 하위 폴더의 깊이는 1이다', () => {
      expect(getFolderDepth('B', folders)).toBe(1);
    });

    test('2단계 하위 폴더의 깊이는 2이다', () => {
      expect(getFolderDepth('C', folders)).toBe(2);
    });

    test('3단계 하위 폴더의 깊이는 3이다', () => {
      expect(getFolderDepth('D', folders)).toBe(3);
    });

    test('folderId가 null이면 깊이는 0이다', () => {
      expect(getFolderDepth(null, folders)).toBe(0);
    });

    test('빈 폴더 목록에서도 깊이는 0이다', () => {
      expect(getFolderDepth('A', [])).toBe(0);
    });
  });
});
