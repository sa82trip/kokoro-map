import { EXPORT_VERSION } from '../types/DocumentTypes';

// 파일명 생성 (특수문자 제거, 날짜 추가)
export const generateExportFilename = (title = 'mindmap') => {
  const sanitized = title
    .replace(/[^a-zA-Z0-9가-힣_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'mindmap';
  const date = new Date().toISOString().split('T')[0];
  return `${sanitized}-${date}.mindmap.json`;
};

// export envelope 생성
export const createExportEnvelope = (data, meta = null) => ({
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  meta: meta ? { title: meta.title, nodeCount: meta.nodeCount } : { title: '마인드맵', nodeCount: 0 },
  data
});

// 파일 다운로드 트리거
export const downloadJSON = (envelope, filename) => {
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // 정리
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

// JSON 내보내기 메인 함수
export const exportToJSON = (data, meta = null) => {
  const envelope = createExportEnvelope(data, meta);
  const filename = generateExportFilename(meta?.title || data?.text || 'mindmap');
  downloadJSON(envelope, filename);
  return { envelope, filename };
};
