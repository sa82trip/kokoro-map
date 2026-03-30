import { useEffect } from 'react';
import useMindMapStore from '../store/MindMapStore';

const useZoom = () => {
  const {
    zoomLevel,
    zoomIn,
    zoomOut,
    setZoomLevel,
    resetZoom,
    viewport,
    setViewport
  } = useMindMapStore();

  // 마우스 휠로 확대/축소
  useEffect(() => {
    const handleWheel = (e) => {
      // Ctrl/Cmd 키가 눌린 경우에만 확대/축소
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(3.0, zoomLevel + delta));

      // 마우스 위치를 기준으로 확대/축소
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 뷰포트 조정 (마우스 위치를 고정)
      const scaleRatio = newZoom / zoomLevel;
      const newViewportX = mouseX - (mouseX - viewport.x) * scaleRatio;
      const newViewportY = mouseY - (mouseY - viewport.y) * scaleRatio;

      setZoomLevel(newZoom);
      setViewport({ x: newViewportX, y: newViewportY });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [zoomLevel, viewport, setZoomLevel, setViewport]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
          case '_':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    setZoomLevel,
    resetZoom,
    isZoomed: zoomLevel !== 1.0,
    zoomPercentage: Math.round(zoomLevel * 100)
  };
};

export default useZoom;