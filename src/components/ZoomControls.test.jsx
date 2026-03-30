import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZoomControls from './ZoomControls';

// Mock the useZoom hook
jest.mock('../hooks/useZoom', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    zoomLevel: 1.0,
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    resetZoom: jest.fn(),
    zoomPercentage: 100
  }))
}));

describe('ZoomControls', () => {
  test('확대/축소 버튼과 레벨 표시를 렌더링해야 한다', () => {
    render(<ZoomControls />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByTitle('축소 (-)')).toBeInTheDocument();
    expect(screen.getByTitle('확대 (+)')).toBeInTheDocument();
    expect(screen.getByTitle('기본 크기 (Ctrl+0)')).toBeInTheDocument();
  });

  test('확대 버튼 클릭 시 zoomIn이 호출된다', async () => {
    const mockZoomIn = jest.fn();
    require('../hooks/useZoom').default.mockReturnValue({
      zoomLevel: 1.0,
      zoomIn: mockZoomIn,
      zoomOut: jest.fn(),
      resetZoom: jest.fn(),
      zoomPercentage: 100
    });

    render(<ZoomControls />);
    const zoomInBtn = screen.getByTitle('확대 (+)');

    await userEvent.click(zoomInBtn);

    expect(mockZoomIn).toHaveBeenCalledTimes(1);
  });

  test('축소 버튼 클릭 시 zoomOut이 호출된다', async () => {
    const mockZoomOut = jest.fn();
    require('../hooks/useZoom').default.mockReturnValue({
      zoomLevel: 1.0,
      zoomIn: jest.fn(),
      zoomOut: mockZoomOut,
      resetZoom: jest.fn(),
      zoomPercentage: 100
    });

    render(<ZoomControls />);
    const zoomOutBtn = screen.getByTitle('축소 (-)');

    await userEvent.click(zoomOutBtn);

    expect(mockZoomOut).toHaveBeenCalledTimes(1);
  });

  test('초기화 버튼 클릭 시 resetZoom이 호출된다', async () => {
    const mockResetZoom = jest.fn();
    require('../hooks/useZoom').default.mockReturnValue({
      zoomLevel: 1.0,
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      resetZoom: mockResetZoom,
      zoomPercentage: 100
    });

    render(<ZoomControls />);
    const resetBtn = screen.getByTitle('기본 크기 (Ctrl+0)');

    await userEvent.click(resetBtn);

    expect(mockResetZoom).toHaveBeenCalledTimes(1);
  });

  test('className prop을 받을 수 있다', () => {
    render(<ZoomControls className="custom-class" />);
    const container = screen.getByText('100%').parentElement.parentElement;
    expect(container).toHaveClass('zoom-controls');
    expect(container).toHaveClass('custom-class');
  });
});