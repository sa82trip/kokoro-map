import React, { useState, useEffect } from 'react';

// iOS 감지 변수 (전역적으로 사용 가능)
// Note: SSR 환경에서 navigator는 undefined이므로 useEffect에서 사용해야 함
export const IS_IOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || navigator.vendor || window.opera) && !window.MSStream;

const MOBILE_BREAKPOINTS = {
  PHONE: 480,
  TABLET: 768,
  DESKTOP: 1024
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop'); // 'phone', 'tablet', 'desktop'
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // iOS 감지
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
      setIsIOS(isIOSDevice);

      setScreenSize({ width, height });

      if (width <= MOBILE_BREAKPOINTS.PHONE) {
        setIsMobile(true);
        setDeviceType('phone');
      } else if (width <= MOBILE_BREAKPOINTS.TABLET) {
        setIsMobile(true);
        setDeviceType('tablet');
      } else {
        setIsMobile(false);
        setDeviceType('desktop');
      }
    };

    // 초기 체크
    checkMobile();

    // 리스너 추가
    window.addEventListener('resize', checkMobile);

    // 방향 변경 감지
    const handleOrientationChange = () => {
      checkMobile();
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    isMobile,
    deviceType,
    screenSize,
    isPhone: deviceType === 'phone',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isIOS
  };
};

export const useTouchSupport = () => {
  const [hasTouchSupport, setHasTouchSupport] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window ||
                   navigator.maxTouchPoints > 0 ||
                   navigator.msMaxTouchPoints > 0;

    setHasTouchSupport(hasTouch);

    const updateTouchSupport = () => {
      const hasTouchNow = 'ontouchstart' in window ||
                        navigator.maxTouchPoints > 0 ||
                        navigator.msMaxTouchPoints > 0;
      setHasTouchSupport(hasTouchNow);
    };

    // 태블릿 접속 시 터치 지원 여부 업데이트
    window.addEventListener('touchstart', updateTouchSupport, { passive: true });
    window.addEventListener('resize', updateTouchSupport);

    return () => {
      window.removeEventListener('touchstart', updateTouchSupport);
      window.removeEventListener('resize', updateTouchSupport);
    };
  }, []);

  return hasTouchSupport;
};

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isPortrait: true,
    isLandscape: false
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = width > height;

      setViewport({
        width,
        height,
        isPortrait,
        isLandscape,
        aspectRatio: width / height
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};

// 모바일 최적화 HOC
export const withMobileDetection = (Component) => {
  return (props) => {
    const mobileInfo = useIsMobile();
    const hasTouch = useTouchSupport();
    const viewport = useViewport();

    return (
      <Component
        {...props}
        isMobile={mobileInfo.isMobile}
        deviceType={mobileInfo.deviceType}
        screenSize={mobileInfo.screenSize}
        hasTouchSupport={hasTouch}
        viewport={viewport}
      />
    );
  };
};

// 모바일에서만 보이는 컴포넌트
export const MobileOnly = ({ children, style = {} }) => {
  const { isMobile } = useIsMobile();

  if (!isMobile) return null;

  return (
    <div style={{
      display: 'block',
      ...style
    }}>
      {children}
    </div>
  );
};

// 모바일에서는 숨기는 컴포넌트
export const DesktopOnly = ({ children, style = {} }) => {
  const { isMobile } = useIsMobile();

  if (isMobile) return null;

  return (
    <div style={{
      display: 'block',
      ...style
    }}>
      {children}
    </div>
  );
};

// 모바일 디바이스 타입별 컴포넌트
export const DeviceSpecific = ({ children, phone, tablet, desktop }) => {
  const { deviceType } = useIsMobile();

  if (deviceType === 'phone' && phone) return phone;
  if (deviceType === 'tablet' && tablet) return tablet;
  if (deviceType === 'desktop' && desktop) return desktop;

  return children || null;
};

export default MobileDetector;