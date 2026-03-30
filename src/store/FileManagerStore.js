import { create } from 'zustand';
import { StorageManager } from '../utils/StorageManager';
import { createDocumentMeta, updateDocumentMeta } from '../types/DocumentTypes';

const useFileManagerStore = create((set, get) => ({
  // 상태
  documents: [],          // DocumentMeta[]
  activeDocumentId: null, // string | null
  initialized: false,

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
  }
}));

export default useFileManagerStore;
