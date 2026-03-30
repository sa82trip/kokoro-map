// 폴더 최대 깊이
export const MAX_FOLDER_DEPTH = 3;

// 폴더 인터페이스
export const IFolder = {
  id: 'string',           // UUID 형식
  name: 'string',         // 폴더명
  parentId: 'string|null', // 부모 폴더 ID
  createdAt: 'string',    // ISO 8601
  order: 'number'         // 정렬 순서
};

// UUID 생성 (crypto.randomUUID + fallback)
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // fallback for jsdom 등 crypto.randomUUID 미지원 환경
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// 폴더 깊이 계산 (parentId 체인을 따라 올라가며 깊이 반환)
export const getFolderDepth = (folderId, allFolders) => {
  if (!folderId) return 0;
  let depth = 0;
  let current = allFolders.find(f => f.id === folderId);
  while (current && current.parentId) {
    depth++;
    current = allFolders.find(f => f.id === current.parentId);
  }
  return depth;
};

// 폴더 생성
export const createFolder = (name, parentId = null) => ({
  id: generateId(),
  name,
  parentId,
  createdAt: new Date().toISOString(),
  order: 0
});

// 폴더 속성 갱신 (불변)
export const updateFolder = (folder, updates) => ({
  ...folder,
  ...updates
});

// 폴더 검증
export const validateFolder = (folder) => {
  const errors = [];

  if (!folder) {
    return { isValid: false, errors: ['폴더 데이터가 없습니다'] };
  }

  if (!folder.id || typeof folder.id !== 'string') {
    errors.push('유효하지 않은 폴더 ID입니다');
  }

  if (!folder.name || typeof folder.name !== 'string') {
    errors.push('유효하지 않은 폴더명입니다');
  }

  if (!folder.createdAt || typeof folder.createdAt !== 'string') {
    errors.push('유효하지 않은 생성일입니다');
  }

  if (typeof folder.order !== 'number' || folder.order < 0) {
    errors.push('유효하지 않은 정렬 순서입니다');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
