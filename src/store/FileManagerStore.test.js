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
    hasIndex: jest.fn(),
    loadFolders: jest.fn(),
    saveFolders: jest.fn(),
    hasFolders: jest.fn()
  }
}));

describe('FileManagerStore', () => {
  beforeEach(() => {
    // 스토어 초기화
    useFileManagerStore.setState({
      documents: [],
      activeDocumentId: null,
      initialized: false,
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'recent',
      searchInContent: false,
      folders: [],
      activeFolderId: null
    });
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('인덱스가 있으면 로드한다', () => {
      const docs = [{ id: 'doc-1', title: '문서 1' }];
      const folders = [{ id: 'f-1', name: '폴더 1', parentId: null }];
      StorageManager.hasIndex.mockReturnValue(true);
      StorageManager.loadIndex.mockReturnValue(docs);
      StorageManager.loadFolders.mockReturnValue(folders);

      useFileManagerStore.getState().initialize();

      expect(StorageManager.loadIndex).toHaveBeenCalled();
      expect(StorageManager.loadFolders).toHaveBeenCalled();
      expect(useFileManagerStore.getState().documents).toEqual(docs);
      expect(useFileManagerStore.getState().folders).toEqual(folders);
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

  describe('검색 및 필터링', () => {
    // 테스트용 문서 세트업 헬퍼
    const setupDocuments = () => {
      const now = new Date();
      const today = now.toISOString();
      const yesterday = new Date(now.getTime() - 86400000).toISOString();
      const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
      const lastWeek = new Date(now.getTime() - 8 * 86400000).toISOString();
      const lastMonth = new Date(now.getTime() - 35 * 86400000).toISOString();

      const docs = [
        { id: 'doc-1', title: '프로젝트 계획', createdAt: twoDaysAgo, updatedAt: today, nodeCount: 5 },
        { id: 'doc-2', title: '회의록', createdAt: lastWeek, updatedAt: yesterday, nodeCount: 3 },
        { id: 'doc-3', title: '프로젝트 아이디어', createdAt: lastMonth, updatedAt: lastWeek, nodeCount: 8 },
        { id: 'doc-4', title: '학습 노트', createdAt: lastMonth, updatedAt: lastMonth, nodeCount: 2 },
      ];

      useFileManagerStore.setState({ documents: docs });
      return { docs, today, yesterday, twoDaysAgo, lastWeek, lastMonth };
    };

    describe('setSearchQuery', () => {
      test('검색어를 설정한다', () => {
        useFileManagerStore.getState().setSearchQuery('테스트');
        expect(useFileManagerStore.getState().searchQuery).toBe('테스트');
      });

      test('빈 문자열로 초기화한다', () => {
        useFileManagerStore.getState().setSearchQuery('테스트');
        useFileManagerStore.getState().setSearchQuery('');
        expect(useFileManagerStore.getState().searchQuery).toBe('');
      });
    });

    describe('setDateFilter', () => {
      test('날짜 필터를 설정한다', () => {
        useFileManagerStore.getState().setDateFilter('today');
        expect(useFileManagerStore.getState().dateFilter).toBe('today');
      });

      test('모든 필터 값을 순환할 수 있다', () => {
        ['all', 'today', 'week', 'month'].forEach(filter => {
          useFileManagerStore.getState().setDateFilter(filter);
          expect(useFileManagerStore.getState().dateFilter).toBe(filter);
        });
      });
    });

    describe('setSortBy', () => {
      test('정렬 기준을 설정한다', () => {
        useFileManagerStore.getState().setSortBy('name');
        expect(useFileManagerStore.getState().sortBy).toBe('name');
      });
    });

    describe('getFilteredDocuments', () => {
      test('필터 없으면 전체 문서를 반환한다', () => {
        const { docs } = setupDocuments();
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(docs.length);
      });

      test('제목으로 검색한다', () => {
        setupDocuments();
        useFileManagerStore.getState().setSearchQuery('프로젝트');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(2);
        result.forEach(d => expect(d.title).toContain('프로젝트'));
      });

      test('검색어는 대소문자 무관하다', () => {
        setupDocuments();
        useFileManagerStore.setState({
          documents: [
            { id: 'd1', title: 'React Notes', createdAt: '2026-01-01', updatedAt: '2026-01-01', nodeCount: 1 },
            { id: 'd2', title: 'Vue Guide', createdAt: '2026-01-01', updatedAt: '2026-01-01', nodeCount: 1 },
          ]
        });
        useFileManagerStore.getState().setSearchQuery('react');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('d1');
      });

      test('오늘 필터: updatedAt이 오늘인 문서만', () => {
        const { today } = setupDocuments();
        useFileManagerStore.getState().setDateFilter('today');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        const todayStr = new Date().toISOString().slice(0, 10);
        expect(result.every(d => d.updatedAt.slice(0, 10) === todayStr)).toBe(true);
      });

      test('이번 주 필터: 최근 7일 이내 수정된 문서', () => {
        setupDocuments();
        useFileManagerStore.getState().setDateFilter('week');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        expect(result.every(d => new Date(d.updatedAt) >= weekAgo)).toBe(true);
      });

      test('이번 달 필터: 최근 30일 이내 수정된 문서', () => {
        setupDocuments();
        useFileManagerStore.getState().setDateFilter('month');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        expect(result.every(d => new Date(d.updatedAt) >= monthAgo)).toBe(true);
      });

      test('최근순 정렬 (기본값)', () => {
        setupDocuments();
        const result = useFileManagerStore.getState().getFilteredDocuments();
        for (let i = 1; i < result.length; i++) {
          expect(new Date(result[i - 1].updatedAt) >= new Date(result[i].updatedAt)).toBe(true);
        }
      });

      test('이름순 정렬', () => {
        setupDocuments();
        useFileManagerStore.getState().setSortBy('name');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].title.localeCompare(result[i].title, 'ko')).toBeLessThanOrEqual(0);
        }
      });

      test('생성순 정렬', () => {
        setupDocuments();
        useFileManagerStore.getState().setSortBy('created');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        for (let i = 1; i < result.length; i++) {
          expect(new Date(result[i - 1].createdAt) >= new Date(result[i].createdAt)).toBe(true);
        }
      });

      test('검색 + 날짜 필터 조합', () => {
        const { today } = setupDocuments();
        useFileManagerStore.getState().setSearchQuery('프로젝트');
        useFileManagerStore.getState().setDateFilter('today');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        // '프로젝트 계획'은 오늘 수정됨, '프로젝트 아이디어'는 지난주
        const todayStr = new Date().toISOString().slice(0, 10);
        result.forEach(d => {
          expect(d.title).toContain('프로젝트');
          expect(d.updatedAt.slice(0, 10)).toBe(todayStr);
        });
      });

      test('검색 결과가 없으면 빈 배열', () => {
        setupDocuments();
        useFileManagerStore.getState().setSearchQuery('존재하지않는키워드');
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toEqual([]);
      });
    });

    describe('노드 내용 검색 (searchInContent)', () => {
      test('searchInContent가 true이면 노드 텍스트도 검색한다', () => {
        useFileManagerStore.setState({
          documents: [
            { id: 'd1', title: '마인드맵', createdAt: '2026-01-01', updatedAt: '2026-01-01', nodeCount: 2 },
            { id: 'd2', title: '회의록', createdAt: '2026-01-01', updatedAt: '2026-01-01', nodeCount: 3 },
          ]
        });
        StorageManager.loadDocument.mockImplementation((docId) => {
          if (docId === 'd1') return { id: 'root', text: '마인드맵', children: [{ id: 'c1', text: 'React 학습', children: [] }] };
          if (docId === 'd2') return { id: 'root', text: '회의록', children: [{ id: 'c2', text: 'Vue 논의', children: [] }] };
          return null;
        });

        useFileManagerStore.getState().setSearchQuery('React');
        useFileManagerStore.getState().setSearchInContent(true);
        const result = useFileManagerStore.getState().getFilteredDocuments();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('d1');
      });

      test('searchInContent가 false(기본값)면 제목만 검색한다', () => {
        useFileManagerStore.setState({
          documents: [
            { id: 'd1', title: '마인드맵', createdAt: '2026-01-01', updatedAt: '2026-01-01', nodeCount: 2 },
          ]
        });
        StorageManager.loadDocument.mockReturnValue({
          id: 'root', text: '마인드맵', children: [{ id: 'c1', text: 'React 학습', children: [] }]
        });

        useFileManagerStore.getState().setSearchQuery('React');
        const result = useFileManagerStore.getState().getFilteredDocuments();

        expect(result).toHaveLength(0);
      });
    });

    describe('clearSearch', () => {
      test('검색 상태를 초기화한다', () => {
        setupDocuments();
        useFileManagerStore.getState().setSearchQuery('테스트');
        useFileManagerStore.getState().setDateFilter('today');
        useFileManagerStore.getState().setSortBy('name');

        useFileManagerStore.getState().clearSearch();

        expect(useFileManagerStore.getState().searchQuery).toBe('');
        expect(useFileManagerStore.getState().dateFilter).toBe('all');
        expect(useFileManagerStore.getState().sortBy).toBe('recent');
        expect(useFileManagerStore.getState().searchInContent).toBe(false);
      });
    });
  });

  describe('폴더 관리', () => {
    describe('createFolder', () => {
      test('루트 폴더를 생성하고 ID를 반환한다', () => {
        const folderId = useFileManagerStore.getState().createFolder('새 폴더');
        expect(folderId).toBeDefined();
        expect(typeof folderId).toBe('string');
        expect(StorageManager.saveFolders).toHaveBeenCalled();
        expect(useFileManagerStore.getState().folders).toHaveLength(1);
        expect(useFileManagerStore.getState().folders[0].name).toBe('새 폴더');
        expect(useFileManagerStore.getState().folders[0].parentId).toBeNull();
      });

      test('하위 폴더를 생성할 수 있다', () => {
        const parentId = useFileManagerStore.getState().createFolder('상위');
        const childId = useFileManagerStore.getState().createFolder('하위', parentId);
        expect(childId).toBeDefined();
        const folders = useFileManagerStore.getState().folders;
        expect(folders).toHaveLength(2);
        expect(folders.find(f => f.id === childId).parentId).toBe(parentId);
      });

      test('order가 형제 수에 따라 설정된다', () => {
        useFileManagerStore.getState().createFolder('폴더 1');
        useFileManagerStore.getState().createFolder('폴더 2');
        const folders = useFileManagerStore.getState().folders;
        expect(folders[0].order).toBe(0);
        expect(folders[1].order).toBe(1);
      });

      test('3단계 초과 생성은 null을 반환한다', () => {
        const f1 = useFileManagerStore.getState().createFolder('Lv1');
        const f2 = useFileManagerStore.getState().createFolder('Lv2', f1);
        const f3 = useFileManagerStore.getState().createFolder('Lv3', f2);
        const f4 = useFileManagerStore.getState().createFolder('Lv4', f3);
        expect(f4).toBeNull();
        expect(useFileManagerStore.getState().folders).toHaveLength(3);
      });
    });

    describe('renameFolder', () => {
      test('폴더 이름을 변경한다', () => {
        const folderId = useFileManagerStore.getState().createFolder('원래 이름');
        useFileManagerStore.getState().renameFolder(folderId, '변경된 이름');
        const folder = useFileManagerStore.getState().folders.find(f => f.id === folderId);
        expect(folder.name).toBe('변경된 이름');
        expect(StorageManager.saveFolders).toHaveBeenCalled();
      });
    });

    describe('deleteFolder', () => {
      test('폴더를 삭제한다', () => {
        const folderId = useFileManagerStore.getState().createFolder('삭제 대상');
        expect(useFileManagerStore.getState().folders).toHaveLength(1);

        useFileManagerStore.getState().deleteFolder(folderId);

        expect(useFileManagerStore.getState().folders).toHaveLength(0);
        expect(StorageManager.saveFolders).toHaveBeenCalled();
      });

      test('하위 폴더도 함께 삭제한다', () => {
        const f1 = useFileManagerStore.getState().createFolder('상위');
        useFileManagerStore.getState().createFolder('하위', f1);
        expect(useFileManagerStore.getState().folders).toHaveLength(2);

        useFileManagerStore.getState().deleteFolder(f1);

        expect(useFileManagerStore.getState().folders).toHaveLength(0);
      });

      test('삭제된 폴더의 문서는 루트로 이동한다', () => {
        const folderId = useFileManagerStore.getState().createFolder('폴더');
        useFileManagerStore.setState({
          documents: [
            { id: 'doc-1', title: '문서', folderId: folderId, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
          ]
        });

        useFileManagerStore.getState().deleteFolder(folderId);

        expect(useFileManagerStore.getState().documents[0].folderId).toBeNull();
        expect(StorageManager.saveIndex).toHaveBeenCalled();
      });

      test('활성 폴더가 삭제되면 activeFolderId가 null이 된다', () => {
        const folderId = useFileManagerStore.getState().createFolder('활성 폴더');
        useFileManagerStore.setState({ activeFolderId: folderId });

        useFileManagerStore.getState().deleteFolder(folderId);

        expect(useFileManagerStore.getState().activeFolderId).toBeNull();
      });
    });

    describe('moveDocumentToFolder', () => {
      test('문서를 폴더로 이동한다', () => {
        const folderId = useFileManagerStore.getState().createFolder('폴더');
        useFileManagerStore.setState({
          documents: [{ id: 'doc-1', title: '문서', folderId: null }]
        });

        const result = useFileManagerStore.getState().moveDocumentToFolder('doc-1', folderId);

        expect(result).toBe(true);
        expect(useFileManagerStore.getState().documents[0].folderId).toBe(folderId);
        expect(StorageManager.saveIndex).toHaveBeenCalled();
      });

      test('문서를 루트로 이동한다 (folderId=null)', () => {
        const folderId = useFileManagerStore.getState().createFolder('폴더');
        useFileManagerStore.setState({
          documents: [{ id: 'doc-1', title: '문서', folderId: folderId }]
        });

        const result = useFileManagerStore.getState().moveDocumentToFolder('doc-1', null);

        expect(result).toBe(true);
        expect(useFileManagerStore.getState().documents[0].folderId).toBeNull();
      });

      test('존재하지 않는 폴더면 false를 반환한다', () => {
        useFileManagerStore.setState({
          documents: [{ id: 'doc-1', title: '문서', folderId: null }]
        });

        const result = useFileManagerStore.getState().moveDocumentToFolder('doc-1', 'nonexistent');

        expect(result).toBe(false);
      });
    });

    describe('setActiveFolderId', () => {
      test('활성 폴더를 설정한다', () => {
        useFileManagerStore.getState().setActiveFolderId('folder-1');
        expect(useFileManagerStore.getState().activeFolderId).toBe('folder-1');
      });

      test('null로 설정하면 전체 문서 모드', () => {
        useFileManagerStore.getState().setActiveFolderId('folder-1');
        useFileManagerStore.getState().setActiveFolderId(null);
        expect(useFileManagerStore.getState().activeFolderId).toBeNull();
      });
    });

    describe('getFilteredDocuments with folder filter', () => {
      test('activeFolderId가 null이면 모든 문서를 반환한다', () => {
        useFileManagerStore.setState({
          documents: [
            { id: 'd1', title: '문서1', folderId: 'f1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
            { id: 'd2', title: '문서2', folderId: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
          ],
          activeFolderId: null
        });
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(2);
      });

      test('activeFolderId가 설정되면 해당 폴더의 문서만 반환한다', () => {
        useFileManagerStore.setState({
          documents: [
            { id: 'd1', title: '문서1', folderId: 'f1', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
            { id: 'd2', title: '문서2', folderId: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
            { id: 'd3', title: '문서3', folderId: 'f1', createdAt: '2026-01-01', updatedAt: '2026-01-01' }
          ],
          activeFolderId: 'f1'
        });
        const result = useFileManagerStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(2);
        result.forEach(d => expect(d.folderId).toBe('f1'));
      });
    });
  });
});
