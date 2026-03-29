import React, { useCallback } from 'react';
import { COLOR_PALETTE } from '../../types/NodeTypes';

const FONT_SIZE_MIN = 10;
const FONT_SIZE_MAX = 48;

// 텍스트 색상용 (가독성 높은 색상)
const TEXT_COLORS = [
  '#FFFFFF', '#000000', '#333333', '#666666',
  '#E74C3C', '#E67E22', '#F39C12', '#2ECC71',
  '#3498DB', '#9B59B6', '#1ABC9C', '#E91E63',
];

// 배경색용 (첫 16색)
const BG_COLORS = COLOR_PALETTE.slice(0, 16);

const NodeEditorToolbar = ({ style, onStyleChange }) => {
  const currentStyle = style || {};

  const handleChange = useCallback((key, value) => {
    onStyleChange({ [key]: value });
  }, [onStyleChange]);

  const toggleBold = useCallback(() => {
    handleChange('fontWeight', currentStyle.fontWeight === 'bold' ? '500' : 'bold');
  }, [currentStyle.fontWeight, handleChange]);

  const toggleItalic = useCallback(() => {
    handleChange('fontStyle', currentStyle.fontStyle === 'italic' ? 'normal' : 'italic');
  }, [currentStyle.fontStyle, handleChange]);

  return (
    <div
      data-testid="node-editor-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        background: '#fff',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'absolute',
        top: -36,
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        zIndex: 1100,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 폰트 크기 슬라이더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#666' }}>A</span>
        <input
          data-testid="font-size-slider"
          type="range"
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          value={currentStyle.fontSize || 16}
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
          style={{ width: 60, cursor: 'pointer' }}
        />
        <span data-testid="font-size-value" style={{ fontSize: 11, color: '#333', minWidth: 20 }}>
          {currentStyle.fontSize || 16}
        </span>
      </div>

      {/* 구분선 */}
      <div style={{ width: 1, height: 20, background: '#ddd' }} />

      {/* Bold 토글 */}
      <button
        data-testid="bold-button"
        onClick={toggleBold}
        style={{
          width: 26, height: 26, border: 'none', borderRadius: 4, cursor: 'pointer',
          background: currentStyle.fontWeight === 'bold' ? '#e6f7ff' : 'transparent',
          fontWeight: 'bold', fontSize: 14, color: '#333',
        }}
        title="굵게"
      >
        B
      </button>

      {/* Italic 토글 */}
      <button
        data-testid="italic-button"
        onClick={toggleItalic}
        style={{
          width: 26, height: 26, border: 'none', borderRadius: 4, cursor: 'pointer',
          background: currentStyle.fontStyle === 'italic' ? '#e6f7ff' : 'transparent',
          fontStyle: 'italic', fontSize: 14, color: '#333',
        }}
        title="기울임"
      >
        I
      </button>

      {/* 구분선 */}
      <div style={{ width: 1, height: 20, background: '#ddd' }} />

      {/* 텍스트 색상 */}
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 100 }}>
        {TEXT_COLORS.map((color) => (
          <div
            key={color}
            data-testid={`color-${color.replace('#', '')}`}
            onClick={() => handleChange('textColor', color)}
            style={{
              width: 14, height: 14, borderRadius: '50%', cursor: 'pointer',
              background: color,
              border: currentStyle.textColor === color ? '2px solid #1890ff' : '1px solid #ccc',
            }}
            title={color}
          />
        ))}
      </div>

      {/* 구분선 */}
      <div style={{ width: 1, height: 20, background: '#ddd' }} />

      {/* 배경색 */}
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 130 }}>
        {BG_COLORS.map((color) => (
          <div
            key={color}
            data-testid={`bg-color-${color.replace('#', '')}`}
            onClick={() => handleChange('backgroundColor', color)}
            style={{
              width: 14, height: 14, borderRadius: '50%', cursor: 'pointer',
              background: color,
              border: currentStyle.backgroundColor === color ? '2px solid #1890ff' : '1px solid #ccc',
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default NodeEditorToolbar;
