import useFileManagerStore from './FileManagerStore';
import { StorageManager } from '../utils/StorageManager';

// StorageManager 모듈 mock
jest.mock('../utils/StorageManager', () => ({
  StorageManager: {
    loadIndex: jest.fn(),
    saveIndex: jest.fn(),
    loadDocument: jest.fn(),
    saveDocument: jest.fn(),
    deleteDocument: jest.fn(),
    loadLegacyData: jest.fn(),
    clearLegacyData: jest.fn(),
    hasLegacyData: jest.fn(),
    hasIndex: jest.fn()
  }
}));

describe('FileManagerStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    useFileManagerStore.setState({
      documents: [],
      activeDocumentId: null,
      initialized: false
    });
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('인덱스가 있으면 로드한다', () => {
      const docs = [{ id: 'doc-1', title: '문서 1' }];
      StorageManager.hasIndex.mockReturnValue(true);
      StorageManager.loadIndex.mockReturnValue(docs);

      useFileManagerStore.getState().initialize();

      expect(StorageManager.loadIndex).toHaveBeenCalled();
      expect(useFileManagerStore.getState().documents).toEqual(docs);
      expect(useFileManagerStore.getState().initialized).toBe(true);
    });

    test('인덱스가 없고 레거시 데이터가 있으면 마이그레이션한다', () => {
      const legacyData = {
        id: 'root', text: '기존 마인드맵', children: [], isRoot: true,
        position: { x: 100, y: 100 }
      };
      StorageManager.hasIndex.mockReturnValue(false);
      StorageManager.hasLegacyData.mockReturnValue(true);
      StorageManager.loadLegacyData.mockReturnValue(legacyData);
      StorageManager.loadIndex.mockReturnValue([]);

      useFileManagerStore.getState().initialize();

      expect(StorageManager.saveDocument).toHaveBeenCalled();
      expect(StorageManager.clearLegacyData).toHaveBeenCalled();
      expect(useFileManagerStore.getState().documents).toHaveLength(1);
      expect(useFileManagerStore.getState().documents[0].title).toBe('기존 마인드맵');
    });

    test('이미 초기화되었으면 다시 실행하지 않는다', () => {
      StorageManager.hasIndex.mockReturnValue(true);
      StorageManager.loadIndex.mockReturnValue([]);

      useFileManagerStore.getState().initialize();
      useFileManagerStore.getState().initialize();

      expect(StorageManager.loadIndex).toHaveBeenCalledTimes(1);
    });

    test('인덱스도 없고 레거시도 없으면 빈 배열로 초기화한다', () => {
      StorageManager.hasIndex.mockReturnValue(false);
      StorageManager.hasLegacyData.mockReturnValue(false);
      StorageManager.loadIndex.mockReturnValue([]);

      useFileManagerStore.getState().initialize();

      expect(useFileManagerStore.getState().documents).toEqual([]);
      expect(useFileManagerStore.getState().initialized).toBe(true);
    });
  });

  describe('createDocument', () => {
    test('새 문서를 생성하고 ID를 반환한다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      const docId = useFileManagerStore.getState().createDocument('새 문서', data);

      expect(docId).toBeDefined();
      expect(typeof docId).toBe('string');
      expect(StorageManager.saveDocument).toHaveBeenCalledWith(docId, data);
      expect(StorageManager.saveIndex).toHaveBeenCalled();
      expect(useFileManagerStore.getState().activeDocumentId).toBe(docId);
    });

    test('데이터 없이 생성하면 메타데이터만 만든다', () => {
      const docId = useFileManagerStore.getState().createDocument('빈 문서', null);

      expect(docId).toBeDefined();
      expect(StorageManager.saveDocument).not.toHaveBeenCalled();
    });

    test('documents 배열에 추가된다', () => {
      useFileManagerStore.getState().createDocument('문서 1', null);
      useFileManagerStore.getState().createDocument('문서 2', null);

      expect(useFileManagerStore.getState().documents).toHaveLength(2);
    });
  });

  describe('saveActiveDocument', () => {
    test('활성 문서를 저장하고 메타데이터를 갱신한다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      const docId = useFileManagerStore.getState().createDocument('테스트', data);

      const newData = { ...data, text: '수정됨' };
      useFileManagerStore.getState().saveActiveDocument(newData);

      expect(StorageManager.saveDocument).toHaveBeenCalledWith(docId, newData);
      expect(StorageManager.saveIndex).toHaveBeenCalled();
    });

    test('활성 문서가 없으면 false를 반환한다', () => {
      useFileManagerStore.setState({ activeDocumentId: null });
      const result = useFileManagerStore.getState().saveActiveDocument({});
      expect(result).toBe(false);
    });
  });

  describe('loadDocument', () => {
    test('문서를 로드하고 activeDocumentId를 설정한다', () => {
      const data = { id: 'root', text: '로드 테스트', children: [], isRoot: true };
      StorageManager.loadDocument.mockReturnValue(data);

      const result = useFileManagerStore.getState().loadDocument('doc-123');

      expect(result).toEqual(data);
      expect(useFileManagerStore.getState().activeDocumentId).toBe('doc-123');
    });

    test('문서가 없으면 null을 반환한다', () => {
      StorageManager.loadDocument.mockReturnValue(null);

      const result = useFileManagerStore.getState().loadDocument('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteDocument', () => {
    test('문서를 삭제한다', () => {
      const docId = useFileManagerStore.getState().createDocument('삭제 테스트', null);
      expect(useFileManagerStore.getState().documents).toHaveLength(1);

      useFileManagerStore.getState().deleteDocument(docId);

      expect(StorageManager.deleteDocument).toHaveBeenCalledWith(docId);
      expect(useFileManagerStore.getState().documents).toHaveLength(0);
      expect(useFileManagerStore.getState().activeDocumentId).toBeNull();
    });

    test('활성 문서가 아니면 activeDocumentId가 유지된다', () => {
      const docId1 = useFileManagerStore.getState().createDocument('문서 1', null);
      const docId2 = useFileManagerStore.getState().createDocument('문서 2', null);

      // docId2가 활성 상태, docId1 삭제
      useFileManagerStore.getState().deleteDocument(docId1);

      expect(useFileManagerStore.getState().activeDocumentId).toBe(docId2);
    });
  });

  describe('getActiveDocumentMeta', () => {
    test('활성 문서 메타데이터를 반환한다', () => {
      const docId = useFileManagerStore.getState().createDocument('메타 테스트', null);
      const meta = useFileManagerStore.getState().getActiveDocumentMeta();

      expect(meta).toBeDefined();
      expect(meta.id).toBe(docId);
      expect(meta.title).toBe('메타 테스트');
    });

    test('활성 문서가 없으면 null을 반환한다', () => {
      useFileManagerStore.setState({ activeDocumentId: null });
      const meta = useFileManagerStore.getState().getActiveDocumentMeta();
      expect(meta).toBeNull();
    });
  });

  describe('migrateFromLegacy', () => {
    test('레거시 데이터를 마이그레이션한다', () => {
      const legacyData = {
        id: 'root', text: '레거시', children: [
          { id: 'c1', text: '자식', children: [], isRoot: false }
        ],
        isRoot: true, position: { x: 0, y: 0 }
      };
      StorageManager.loadLegacyData.mockReturnValue(legacyData);

      const docId = useFileManagerStore.getState().migrateFromLegacy();

      expect(docId).toBeDefined();
      expect(StorageManager.saveDocument).toHaveBeenCalledWith(docId, legacyData);
      expect(StorageManager.clearLegacyData).toHaveBeenCalled();
      expect(useFileManagerStore.getState().documents).toHaveLength(1);
      expect(useFileManagerStore.getState().documents[0].title).toBe('레거시');
      expect(useFileManagerStore.getState().documents[0].nodeCount).toBe(2);
    });

    test('레거시 데이터가 없으면 null을 반환한다', () => {
      StorageManager.loadLegacyData.mockReturnValue(null);
      const result = useFileManagerStore.getState().migrateFromLegacy();
      expect(result).toBeNull();
    });
  });
});
