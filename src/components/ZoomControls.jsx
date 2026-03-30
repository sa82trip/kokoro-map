import React from 'react';
import useZoom from '../hooks/useZoom';
import '../styles/ZoomControls.css';

const ZoomControls = ({ className = '' }) => {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, zoomPercentage } = useZoom();

  return (
    <div className={`zoom-controls ${className}`}>
      <button
        className="zoom-btn zoom-out"
        onClick={zoomOut}
        title="축소 (-)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <div className="zoom-level">
        <span>{zoomPercentage}%</span>
        <button
          className="zoom-reset"
          onClick={resetZoom}
          title="기본 크기 (Ctrl+0)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        </button>
      </div>

      <button
        className="zoom-btn zoom-in"
        onClick={zoomIn}
        title="확대 (+)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
};

export default ZoomControls;