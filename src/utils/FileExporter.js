import { EXPORT_VERSION } from '../types/DocumentTypes';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { generateExportFilename } from './StringUtils';
import { downloadJSON } from './FileHelper';

// export envelope 생성
export const createExportEnvelope = (data, meta = null) => ({
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  meta: meta ? { title: meta.title, nodeCount: meta.nodeCount } : { title: '마인드맵', nodeCount: 0 },
  data
});

// 파일 다운로드 트리거 - FileHelper에서 가져옴

// PNG 내보내기 관련 유틸리티
export const generatePNGFilename = (title = 'mindmap') => {
  return generateExportFilename(title, 'png');
};

export const calculateCaptureArea = (container, padding = 20) => {
  // 캐시된 컨테이너 렉트 사용
  const containerRect = container.getBoundingClientRect();

  // 모든 노드의 위치 정보 수집
  const nodes = container.querySelectorAll('.node:not([hidden])');
  if (nodes.length === 0) {
    return {
      left: 0,
      top: 0,
      width: container.offsetWidth,
      height: container.offsetHeight
    };
  }

  // 단일 반복으로 min/max 계산
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  nodes.forEach(node => {
    const rect = node.getBoundingClientRect();
    // 보정된 위치 계산
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
  });

  // 여백 추가
  return {
    left: minX - padding,
    top: minY - padding,
    width: maxX - minX + 2 * padding,
    height: maxY - minY + 2 * padding
  };
};

// PNG 내보내기 메인 함수
export const exportToPNG = async (element, config = {}) => {
  const {
    background = 'theme',
    padding = 20,
    scale = 2
  } = config;

  // 캡처 영역 계산
  const captureRect = calculateCaptureArea(element, padding);

  // 배경색 처리
  let backgroundColor = 'transparent';
  if (background === 'white') {
    backgroundColor = '#ffffff';
  } else if (background === 'theme') {
    backgroundColor = window.getComputedStyle(element).backgroundColor || 'transparent';
  }

  // 옵션 설정
  const options = {
    backgroundColor,
    pixelRatio: scale,
    quality: 0.95,
    width: captureRect.width,
    height: captureRect.height,
    filter: (node) => {
      // SVG 연결선은 항상 포함
      if (node.classList?.contains('connection')) return true;
      // 노드만 캡처
      return node.classList?.contains('node') || node.classList?.contains('connection');
    }
  };

  try {
    const blob = await toPng(element, options);
    const filename = generatePNGFilename();
    saveAs(blob, filename);
    return { blob, filename };
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('PNG 내보내기에 실패했습니다.');
  }
};

// JSON 내보내기 메인 함수
export const exportToJSON = (data, meta = null) => {
  const envelope = createExportEnvelope(data, meta);
  const filename = generateExportFilename(meta?.title || data?.text || 'mindmap');
  downloadJSON(envelope, filename);
  return { envelope, filename };
};
