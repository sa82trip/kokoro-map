// 공통 유틸리티 함수

// 파일명에서 특수문자 제거
export const sanitizeFilename = (title = 'mindmap') => {
  return title
    .replace(/[^a-zA-Z0-9가-힣_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'mindmap';
};

// 날짜 포맷팅
export const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// 파일명 생성
export const generateExportFilename = (title = 'mindmap', extension = 'json') => {
  const sanitized = sanitizeFilename(title);
  const date = formatDate();
  return `${sanitized}-${date}.${extension}`;
};