import { create } from 'zustand';
import { StorageManager } from '../utils/StorageManager';
import { createDocumentMeta, updateDocumentMeta } from '../types/DocumentTypes';
import { createFolder as createFolderData, getFolderDepth, MAX_FOLDER_DEPTH } from '../types/FolderTypes';

// 노드 트리 내 키워드 검색 헬퍼
const searchInNodeTree = (node, query) => {
  if (!node) return false;
  if (node.text && node.text.toLowerCase().indexOf(query) !== -1) return true;
  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      if (searchInNodeTree(node.children[i], query)) return true;
    }
  }
  return false;
};

// 폴더 자손 ID 수집 헬퍼
const getDescendantFolderIds = (folderId, folders) => {
  const children = folders.filter(f => f.parentId === folderId);
  let ids = [folderId];
  children.forEach(child => {
    ids = ids.concat(getDescendantFolderIds(child.id, folders));
  });
  return ids;
};

const useFileManagerStore = create((set, get) => ({
  // 상태
  documents: [],          // DocumentMeta[]
  activeDocumentId: null, // string | null
  initialized: false,

  // 검색/필터 상태
  searchQuery: '',        // 검색어
  dateFilter: 'all',      // 'all' | 'today' | 'week' | 'month'
  sortBy: 'recent',       // 'recent' | 'name' | 'created'
  searchInContent: false, // 노드 내용도 검색할지

  // 폴더 상태
  folders: [],            // Folder[]
  activeFolderId: null,   // string | null (null = 전체 문서)

  // 초기화 (앱 시작 시 1회 호출)
  initialize: () => {
    const { initialized } = get();
    if (initialized) return;

    // 레거시 마이그레이션
    if (!StorageManager.hasIndex() && StorageManager.hasLegacyData()) {
      get().migrateFromLegacy();
      set({ initialized: true });
      return;
    }

    // 인덱스 로드
    const docs = StorageManager.loadIndex();
    const folders = StorageManager.loadFolders();
    set({ documents: docs, folders, initialized: true });
  },

  // 레거시 데이터 마이그레이션
  migrateFromLegacy: () => {
    const legacyData = StorageManager.loadLegacyData();
    if (!legacyData) return null;

    const title = legacyData.text || '마인드맵';
    const meta = createDocumentMeta(title, legacyData);

    StorageManager.saveDocument(meta.id, legacyData);
    StorageManager.saveIndex([meta]);
    StorageManager.clearLegacyData();

    set({
      documents: [meta],
      activeDocumentId: meta.id
    });

    return meta.id;
  },

  // 새 문서 생성
  createDocument: (title = '마인드맵', data = null) => {
    const meta = createDocumentMeta(title, data);

    // 문서 데이터 저장
    if (data) {
      StorageManager.saveDocument(meta.id, data);
    }

    // 인덱스 업데이트
    const docs = [...get().documents, meta];
    StorageManager.saveIndex(docs);

    set({
      documents: docs,
      activeDocumentId: meta.id
    });

    return meta.id;
  },

  // 활성 문서 저장
  saveActiveDocument: (data) => {
    const { activeDocumentId, documents } = get();
    if (!activeDocumentId) return false;

    // 문서 데이터 저장
    StorageManager.saveDocument(activeDocumentId, data);

    // 메타데이터 갱신
    const updatedDocs = documents.map(doc => {
      if (doc.id === activeDocumentId) {
        return updateDocumentMeta(doc, data);
      }
      return doc;
    });

    StorageManager.saveIndex(updatedDocs);
    set({ documents: updatedDocs });

    return true;
  },

  // 문서 로드
  loadDocument: (docId) => {
    const data = StorageManager.loadDocument(docId);
    if (data) {
      set({ activeDocumentId: docId });
    }
    return data;
  },

  // 문서 삭제
  deleteDocument: (docId) => {
    const { documents, activeDocumentId } = get();

    StorageManager.deleteDocument(docId);

    const updatedDocs = documents.filter(doc => doc.id !== docId);
    StorageManager.saveIndex(updatedDocs);

    set({
      documents: updatedDocs,
      activeDocumentId: activeDocumentId === docId ? null : activeDocumentId
    });

    return true;
  },

  // 활성 문서 메타데이터 반환
  getActiveDocumentMeta: () => {
    const { activeDocumentId, documents } = get();
    return documents.find(doc => doc.id === activeDocumentId) || null;
  },

  // 활성 문서 ID 설정
  setActiveDocumentId: (docId) => {
    set({ activeDocumentId: docId });
  },

  // 검색어 설정
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // 날짜 필터 설정
  setDateFilter: (filter) => {
    set({ dateFilter: filter });
  },

  // 정렬 기준 설정
  setSortBy: (sort) => {
    set({ sortBy: sort });
  },

  // 노드 내용 검색 토글
  setSearchInContent: (enabled) => {
    set({ searchInContent: enabled });
  },

  // 검색 상태 초기화
  clearSearch: () => {
    set({
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'recent',
      searchInContent: false
    });
  },

  // 검색/필터/정렬이 적용된 문서 목록 반환
  getFilteredDocuments: () => {
    const { documents, searchQuery, dateFilter, sortBy, searchInContent, activeFolderId } = get();
    let result = [...documents];

    // 폴더 필터
    if (activeFolderId !== null) {
      result = result.filter(doc => doc.folderId === activeFolderId);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc => {
        // 제목 검색
        if (doc.title.toLowerCase().indexOf(query) !== -1) return true;

        // 노드 내용 검색 (옵션)
        if (searchInContent) {
          const data = StorageManager.loadDocument(doc.id);
          if (data && searchInNodeTree(data, query)) return true;
        }

        return false;
      });
    }

    // 날짜 필터
    if (dateFilter !== 'all') {
      const now = new Date();
      let threshold;

      if (dateFilter === 'today') {
        threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateFilter === 'week') {
        threshold = new Date(now.getTime() - 7 * 86400000);
      } else if (dateFilter === 'month') {
        threshold = new Date(now.getTime() - 30 * 86400000);
      }

      if (threshold) {
        result = result.filter(doc => new Date(doc.updatedAt) >= threshold);
      }
    }

    // 정렬
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else if (sortBy === 'created') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  },

  // 폴더 생성
  createFolder: (name, parentId = null) => {
    const { folders } = get();

    // 깊이 검증 (부모 폴더의 깊이가 MAX_FOLDER_DEPTH-1 이하인지 확인)
    if (parentId !== null) {
      const parentDepth = getFolderDepth(parentId, folders);
      if (parentDepth >= MAX_FOLDER_DEPTH - 1) {
        return null;
      }
    }

    const order = folders.filter(f => f.parentId === parentId).length;
    const folder = { ...createFolderData(name, parentId), order };

    const updatedFolders = [...folders, folder];
    StorageManager.saveFolders(updatedFolders);
    set({ folders: updatedFolders });

    return folder.id;
  },

  // 폴더 이름 변경
  renameFolder: (folderId, newName) => {
    const { folders } = get();

    const updatedFolders = folders.map(f =>
      f.id === folderId ? { ...f, name: newName } : f
    );

    StorageManager.saveFolders(updatedFolders);
    set({ folders: updatedFolders });
  },

  // 폴더 삭제 (하위 폴더 및 문서 정리)
  deleteFolder: (folderId) => {
    const { folders, documents, activeFolderId } = get();

    // 삭제할 폴더 ID 목록 (자손 포함)
    const deleteIds = getDescendantFolderIds(folderId, folders);

    // 폴더에서 삭제
    const updatedFolders = folders.filter(f => deleteIds.indexOf(f.id) === -1);

    // 고아 문서를 루트로 이동
    const updatedDocs = documents.map(doc =>
      deleteIds.indexOf(doc.folderId) !== -1 ? { ...doc, folderId: null } : doc
    );

    StorageManager.saveFolders(updatedFolders);
    StorageManager.saveIndex(updatedDocs);

    set({
      folders: updatedFolders,
      documents: updatedDocs,
      activeFolderId: deleteIds.indexOf(activeFolderId) !== -1 ? null : activeFolderId
    });
  },

  // 문서를 폴더로 이동
  moveDocumentToFolder: (docId, folderId) => {
    const { documents, folders } = get();

    // 폴더 존재 검증 (null은 루트이므로 허용)
    if (folderId !== null && !folders.find(f => f.id === folderId)) {
      return false;
    }

    const updatedDocs = documents.map(doc =>
      doc.id === docId ? { ...doc, folderId } : doc
    );

    StorageManager.saveIndex(updatedDocs);
    set({ documents: updatedDocs });

    return true;
  },

  // 활성 폴더 설정
  setActiveFolderId: (folderId) => {
    set({ activeFolderId: folderId });
  }
}));

export default useFileManagerStore;
