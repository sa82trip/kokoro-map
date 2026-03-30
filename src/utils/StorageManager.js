// 다중 문서 localStorage 관리 유틸리티
// 기존 단일 키(mindmap-app-data) → 다중 키(mindmap-docs/*) 관리

const STORAGE_PREFIX = 'mindmap-docs';
const INDEX_KEY = `${STORAGE_PREFIX}/index`;
const DOC_KEY_PREFIX = `${STORAGE_PREFIX}/`;
const FOLDERS_KEY = `${STORAGE_PREFIX}/folders`;
const LEGACY_KEY = 'mindmap-app-data';

export const StorageManager = {
  // 문서 인덱스 로드
  loadIndex: () => {
    try {
      const saved = localStorage.getItem(INDEX_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('문서 인덱스 로드 실패:', e);
      return [];
    }
  },

  // 문서 인덱스 저장
  saveIndex: (docs) => {
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify(docs));
      return true;
    } catch (e) {
      console.warn('문서 인덱스 저장 실패:', e);
      return false;
    }
  },

  // 개별 문서 데이터 로드
  loadDocument: (docId) => {
    try {
      const key = `${DOC_KEY_PREFIX}${docId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn(`문서 로드 실패 (${docId}):`, e);
      return null;
    }
  },

  // 개별 문서 데이터 저장
  saveDocument: (docId, data) => {
    try {
      const key = `${DOC_KEY_PREFIX}${docId}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn(`문서 저장 실패 (${docId}):`, e);
      return false;
    }
  },

  // 개별 문서 데이터 삭제
  deleteDocument: (docId) => {
    try {
      const key = `${DOC_KEY_PREFIX}${docId}`;
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`문서 삭제 실패 (${docId}):`, e);
      return false;
    }
  },

  // 레거시 데이터 로드 (기존 mindmap-app-data)
  loadLegacyData: () => {
    try {
      const saved = localStorage.getItem(LEGACY_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('레거시 데이터 로드 실패:', e);
      return null;
    }
  },

  // 레거시 데이터 삭제
  clearLegacyData: () => {
    try {
      localStorage.removeItem(LEGACY_KEY);
      return true;
    } catch (e) {
      console.warn('레거시 데이터 삭제 실패:', e);
      return false;
    }
  },

  // 레거시 데이터 존재 여부
  hasLegacyData: () => {
    try {
      return localStorage.getItem(LEGACY_KEY) !== null;
    } catch (e) {
      return false;
    }
  },

  // 새 인덱스 존재 여부
  hasIndex: () => {
    try {
      return localStorage.getItem(INDEX_KEY) !== null;
    } catch (e) {
      return false;
    }
  },

  // 폴더 목록 로드
  loadFolders: () => {
    try {
      const saved = localStorage.getItem(FOLDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('폴더 목록 로드 실패:', e);
      return [];
    }
  },

  // 폴더 목록 저장
  saveFolders: (folders) => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
      return true;
    } catch (e) {
      console.warn('폴더 목록 저장 실패:', e);
      return false;
    }
  },

  // 폴더 데이터 존재 여부
  hasFolders: () => {
    try {
      return localStorage.getItem(FOLDERS_KEY) !== null;
    } catch (e) {
      return false;
    }
  }
};
