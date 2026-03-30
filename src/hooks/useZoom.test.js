import { renderHook } from '@testing-library/react';
import useZoom from './useZoom';
import useMindMapStore from '../store/MindMapStore';

// Mock the MindMapStore
jest.mock('../store/MindMapStore');
const mockUseMindMapStore = useMindMapStore;

describe('useZoom', () => {
  beforeEach(() => {
    mockUseMindMapStore.mockReturnValue({
      zoomLevel: 1.0,
      maxZoom: 3.0,
      minZoom: 0.25,
      zoomStep: 0.25,
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      setZoomLevel: jest.fn(),
      resetZoom: jest.fn(),
      viewport: { x: 0, y: 0 },
      setViewport: jest.fn()
    });

    // Mock window event listeners
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('확대 레벨을 반환해야 한다', () => {
    const { result } = renderHook(() => useZoom());
    expect(result.current).toEqual(
      expect.objectContaining({
        zoomLevel: 1.0,
        isZoomed: false,
        zoomPercentage: 100
      })
    );
  });

  test('zoomIn/zoomOut 함수를 제공해야 한다', () => {
    const { result } = renderHook(() => useZoom());
    expect(result.current).toEqual(
      expect.objectContaining({
        zoomIn: expect.any(Function),
        zoomOut: expect.any(Function),
        setZoomLevel: expect.any(Function),
        resetZoom: expect.any(Function)
      })
    );
  });

  test('isZoomed이 올바르게 계산된다', () => {
    mockUseMindMapStore.mockReturnValueOnce({
      zoomLevel: 1.0,
      maxZoom: 3.0,
      minZoom: 0.25,
      zoomStep: 0.25,
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      setZoomLevel: jest.fn(),
      resetZoom: jest.fn(),
      viewport: { x: 0, y: 0 },
      setViewport: jest.fn()
    });

    const { result, rerender } = renderHook(() => useZoom());

    expect(result.current.isZoomed).toBe(false);

    // Simulate zoom level change
    mockUseMindMapStore.mockReturnValueOnce({
      zoomLevel: 1.5,
      maxZoom: 3.0,
      minZoom: 0.25,
      zoomStep: 0.25,
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      setZoomLevel: jest.fn(),
      resetZoom: jest.fn(),
      viewport: { x: 0, y: 0 },
      setViewport: jest.fn()
    });

    rerender();
    expect(result.current.isZoomed).toBe(true);
  });

  test('zoomPercentage가 올바르게 계산된다', () => {
    mockUseMindMapStore.mockReturnValueOnce({
      zoomLevel: 1.5,
      maxZoom: 3.0,
      minZoom: 0.25,
      zoomStep: 0.25,
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      setZoomLevel: jest.fn(),
      resetZoom: jest.fn(),
      viewport: { x: 0, y: 0 },
      setViewport: jest.fn()
    });

    const { result } = renderHook(() => useZoom());
    expect(result.current.zoomPercentage).toBe(150);
  });

  test('wheel 이벤트 리스너가 등록되어야 한다', () => {
    renderHook(() => useZoom());
    expect(window.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
  });

  test('keydown 이벤트 리스너가 등록되어야 한다', () => {
    renderHook(() => useZoom());
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});