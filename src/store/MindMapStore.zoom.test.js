import { renderHook, act } from '@testing-library/react';
import useMindMapStore from './MindMapStore';

describe('MindMapStore - Zoom', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMindMapStore());
    act(() => {
      result.current.reset();
    });
  });

  test('초기 확대 레벨은 1.0이다', () => {
    const { result } = renderHook(() => useMindMapStore());
    expect(result.current.zoomLevel).toBe(1.0);
  });

  test('zoomIn으로 확대할 수 있다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoomLevel).toBe(1.25); // 1.0 + 0.25
  });

  test('zoomOut으로 축소할 수 있다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.zoomLevel).toBe(0.75); // 1.0 - 0.25
  });

  test('setZoomLevel으로 특정 레벨을 설정할 수 있다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(1.5);
    });

    expect(result.current.zoomLevel).toBe(1.5);
  });

  test('최대 확대 레벨을 초과할 수 없다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(4.0);
    });

    expect(result.current.zoomLevel).toBe(3.0); // 최대값
  });

  test('최소 축소 레벨 미만으로 내려갈 수 없다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(0.1);
    });

    expect(result.current.zoomLevel).toBe(0.25); // 최소값
  });

  test('resetZoom으로 초기화할 수 있다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(2.0);
      result.current.resetZoom();
    });

    expect(result.current.zoomLevel).toBe(1.0);
  });

  test('연속 확대/축소가 정확하게 동작한다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
      result.current.zoomOut();
    });

    expect(result.current.zoomLevel).toBe(1.25); // 1.0 + 0.25 + 0.25 - 0.25
  });

  test('초기 상태에 확대/축소 관련 값이 포함된다', () => {
    const { result } = renderHook(() => useMindMapStore());

    expect(result.current).toEqual(
      expect.objectContaining({
        zoomLevel: 1.0,
        maxZoom: 3.0,
        minZoom: 0.25,
        zoomStep: 0.25
      })
    );
  });

  test('reset 액션에 확대/축소 상태 초기화가 포함된다', () => {
    const { result } = renderHook(() => useMindMapStore());

    act(() => {
      result.current.setZoomLevel(2.0);
      result.current.reset();
    });

    expect(result.current.zoomLevel).toBe(1.0);
  });
});