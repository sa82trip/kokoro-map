// 클라이언트 사이드에서만 실행되는 iOS 감지 유틸리티
export const detectIOS = () => {
  if (typeof window === 'undefined' || !navigator) {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

// 클라이언트 사이드에서만 실행되는 모바일 감지 유틸리티
export const detectMobile = () => {
  if (typeof window === 'undefined' || !window.innerWidth) {
    return false;
  }

  const width = window.innerWidth;
  return width <= 768; // 태블릿 기준
};

// 클라이언트 사이드에서만 실행되는 터치 지원 감지
export const detectTouchSupport = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         navigator.msMaxTouchPoints > 0;
};