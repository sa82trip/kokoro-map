// 문서 내보내기 포맷 버전
export const EXPORT_VERSION = 1;

// 문서 메타데이터 인터페이스
export const IDocumentMeta = {
  id: 'string',           // UUID 형식
  title: 'string',
  folderId: 'string|null',
  createdAt: 'string',    // ISO 8601
  updatedAt: 'string',    // ISO 8601
  nodeCount: 'number',
  thumbnail: 'string'     // 선택 (data URL)
};

// UUID 생성 (crypto.randomUUID + fallback)
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // fallback for jsdom 등 crypto.randomUUID 미지원 환경
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// 노드 수 계산 (트리 순회)
const countNodes = (data) => {
  if (!data) return 0;
  let count = 1;
  if (data.children && Array.isArray(data.children)) {
    count += data.children.reduce((sum, child) => sum + countNodes(child), 0);
  }
  return count;
};

// 문서 메타데이터 생성
export const createDocumentMeta = (title = '마인드맵', data = null) => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    folderId: null,
    createdAt: now,
    updatedAt: now,
    nodeCount: data ? countNodes(data) : 0,
    thumbnail: null
  };
};

// 문서 메타데이터 갱신 (저장 시)
export const updateDocumentMeta = (meta, data = null) => ({
  ...meta,
  title: (data && data.text) ? data.text : meta.title,
  updatedAt: new Date().toISOString(),
  nodeCount: data ? countNodes(data) : meta.nodeCount
});

// 문서 메타데이터 검증
export const validateDocumentMeta = (meta) => {
  const errors = [];

  if (!meta) {
    return { isValid: false, errors: ['메타데이터가 없습니다'] };
  }

  if (!meta.id || typeof meta.id !== 'string') {
    errors.push('유효하지 않은 문서 ID입니다');
  }

  if (!meta.title || typeof meta.title !== 'string') {
    errors.push('유효하지 않은 문서 제목입니다');
  }

  if (!meta.createdAt || typeof meta.createdAt !== 'string') {
    errors.push('유효하지 않은 생성일입니다');
  }

  if (!meta.updatedAt || typeof meta.updatedAt !== 'string') {
    errors.push('유효하지 않은 수정일입니다');
  }

  if (typeof meta.nodeCount !== 'number' || meta.nodeCount < 0) {
    errors.push('유효하지 않은 노드 수입니다');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
