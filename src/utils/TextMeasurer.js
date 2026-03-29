// 텍스트 측정 캐시
const measureCache = new Map();

const measureText = (text, fontSize = 16, fontWeight = '500', fontStyle = 'normal') => {
  const key = `${text}|${fontSize}|${fontWeight}|${fontStyle}`;
  if (measureCache.has(key)) return measureCache.get(key);

  const fallbackWidth = text.length * fontSize * 0.6 + 32;
  const fallbackResult = { width: Math.max(120, Math.ceil(fallbackWidth)), height: Math.max(40, Math.ceil(fontSize * 2.5)) };

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      measureCache.set(key, fallbackResult);
      return fallbackResult;
    }
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px sans-serif`;
    const width = ctx.measureText(text).width;
    const result = { width: Math.max(120, Math.ceil(width) + 32), height: Math.max(40, Math.ceil(fontSize * 2.5)) };
    measureCache.set(key, result);
    if (measureCache.size > 500) measureCache.clear();
    return result;
  } catch {
    measureCache.set(key, fallbackResult);
    return fallbackResult;
  }
};

export { measureText };
export default measureText;
