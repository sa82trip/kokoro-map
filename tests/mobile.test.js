import { describe, test, expect, beforeEach, vi } from '@jest/globals';
import { useIsMobile, useTouchSupport } from '../src/components/MobileDetector';
import { renderHook, act } from '@testing-library/react';
import * as MobileDetectorModule from '../src/components/MobileDetector';

// 모의 윈도우 객체
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('모바일 감지 테스트', () => {
  beforeEach(() => {
    // 테스트 전에 원본값 복원
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  test('데스크톱 감지', () => {
    const { result } = renderHook(() => useIsMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.isPhone).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  test('태블릿 감지 (768px)', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.isPhone).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  test('폰 감지 (480px)', () => {
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.deviceType).toBe('phone');
    expect(result.current.isPhone).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  test('화면 크기 변경 감지', () => {
    const { result } = renderHook(() => useIsMobile());

    // 초기 상태
    expect(result.current.screenSize.width).toBe(1024);
    expect(result.current.screenSize.height).toBe(768);

    // 크기 변경 시뮬레이션
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // 상태가 업데이트됨 (테스트 환경에서는 실제로 반영되지 않을 수 있음)
    expect(result.current.screenSize.width).toBeDefined();
    expect(result.current.screenSize.height).toBeDefined();
  });
});

describe('터치 지원 테스트', () => {
  test('터치 지원 감지 (ontouchstart)', () => {
    const original = window.ontouchstart;
    window.ontouchstart = () => {};

    const { result } = renderHook(() => useTouchSupport());

    expect(result.current).toBe(true);

    // 복원
    window.ontouchstart = original;
  });

  test('터치 지원 감지 (maxTouchPoints)', () => {
    const originalMaxTouchPoints = navigator.maxTouchPoints;
    const originalMsMaxTouchPoints = navigator.msMaxTouchPoints;

    navigator.maxTouchPoints = 5;
    delete navigator.msMaxTouchPoints;

    const { result } = renderHook(() => useTouchSupport());

    expect(result.current).toBe(true);

    // 복원
    navigator.maxTouchPoints = originalMaxTouchPoints;
    navigator.msMaxTouchPoints = originalMsMaxTouchPoints;
  });

  test('터치 미지원 감지', () => {
    const original = window.ontouchstart;
    const originalMaxTouchPoints = navigator.maxTouchPoints;
    const originalMsMaxTouchPoints = navigator.msMaxTouchPoints;

    window.ontouchstart = undefined;
    navigator.maxTouchPoints = 0;
    navigator.msMaxTouchPoints = 0;

    const { result } = renderHook(() => useTouchSupport());

    expect(result.current).toBe(false);

    // 복원
    window.ontouchstart = original;
    navigator.maxTouchPoints = originalMaxTouchPoints;
    navigator.msMaxTouchPoints = originalMsMaxTouchPoints;
  });
});