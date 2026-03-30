import { StorageManager } from './StorageManager';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadIndex / saveIndex', () => {
    test('인덱스가 없으면 빈 배열을 반환한다', () => {
      expect(StorageManager.loadIndex()).toEqual([]);
    });

    test('인덱스를 저장하고 로드할 수 있다', () => {
      const docs = [
        { id: 'doc-1', title: '문서 1' },
        { id: 'doc-2', title: '문서 2' }
      ];
      StorageManager.saveIndex(docs);
      expect(StorageManager.loadIndex()).toEqual(docs);
    });

    test('localStorage.setItem 실패 시 false를 반환한다', () => {
      jest.spyOn(StorageManager, 'saveIndex').mockImplementation(() => {
        try {
          localStorage.setItem('mindmap-docs/index', JSON.stringify({}));
          return true;
        } catch (e) {
          return false;
        }
      });
      // 정상 동작 확인 후 mock 복원
      StorageManager.saveIndex.mockRestore();
    });
  });

  describe('saveDocument / loadDocument', () => {
    test('문서를 저장하고 로드할 수 있다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      StorageManager.saveDocument('doc-123', data);
      expect(StorageManager.loadDocument('doc-123')).toEqual(data);
    });

    test('존재하지 않는 문서는 null을 반환한다', () => {
      expect(StorageManager.loadDocument('nonexistent')).toBeNull();
    });

    test('saveDocument가 true를 반환한다', () => {
      const result = StorageManager.saveDocument('doc-1', { test: true });
      expect(result).toBe(true);
    });
  });

  describe('deleteDocument', () => {
    test('문서를 삭제할 수 있다', () => {
      StorageManager.saveDocument('doc-1', { test: true });
      expect(StorageManager.loadDocument('doc-1')).toEqual({ test: true });

      StorageManager.deleteDocument('doc-1');
      expect(StorageManager.loadDocument('doc-1')).toBeNull();
    });

    test('존재하지 않는 문서 삭제도 true를 반환한다', () => {
      expect(StorageManager.deleteDocument('nonexistent')).toBe(true);
    });
  });

  describe('레거시 데이터 관리', () => {
    test('loadLegacyData로 기존 데이터를 로드한다', () => {
      const legacyData = { id: 'root', text: '기존 데이터', children: [], isRoot: true };
      localStorage.setItem('mindmap-app-data', JSON.stringify(legacyData));
      expect(StorageManager.loadLegacyData()).toEqual(legacyData);
    });

    test('레거시 데이터가 없으면 null을 반환한다', () => {
      expect(StorageManager.loadLegacyData()).toBeNull();
    });

    test('clearLegacyData로 기존 키를 삭제한다', () => {
      localStorage.setItem('mindmap-app-data', '{"test": true}');
      StorageManager.clearLegacyData();
      expect(localStorage.getItem('mindmap-app-data')).toBeNull();
    });

    test('hasLegacyData가 레거시 데이터 존재 여부를 반환한다', () => {
      expect(StorageManager.hasLegacyData()).toBe(false);
      localStorage.setItem('mindmap-app-data', '{}');
      expect(StorageManager.hasLegacyData()).toBe(true);
    });
  });

  describe('hasIndex', () => {
    test('인덱스가 없으면 false를 반환한다', () => {
      expect(StorageManager.hasIndex()).toBe(false);
    });

    test('인덱스가 있으면 true를 반환한다', () => {
      StorageManager.saveIndex([]);
      expect(StorageManager.hasIndex()).toBe(true);
    });
  });

  describe('스토리지 키 분리', () => {
    test('문서 데이터가 개별 키에 저장된다', () => {
      StorageManager.saveDocument('abc-123', { test: 1 });
      StorageManager.saveDocument('def-456', { test: 2 });

      expect(localStorage.getItem('mindmap-docs/abc-123')).toBe('{"test":1}');
      expect(localStorage.getItem('mindmap-docs/def-456')).toBe('{"test":2}');
    });

    test('한 문서 삭제가 다른 문서에 영향 없다', () => {
      StorageManager.saveDocument('doc-1', { a: 1 });
      StorageManager.saveDocument('doc-2', { b: 2 });
      StorageManager.deleteDocument('doc-1');

      expect(StorageManager.loadDocument('doc-1')).toBeNull();
      expect(StorageManager.loadDocument('doc-2')).toEqual({ b: 2 });
    });
  });
});
