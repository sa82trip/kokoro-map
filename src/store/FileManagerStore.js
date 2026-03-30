import { create } from 'zustand';
import { StorageManager } from '../utils/StorageManager';
import { createDocumentMeta, updateDocumentMeta } from '../types/DocumentTypes';

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
    set({ documents: docs, initialized: true });
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
    const { documents, searchQuery, dateFilter, sortBy, searchInContent } = get();
    let result = [...documents];

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
  }
}));

export default useFileManagerStore;
