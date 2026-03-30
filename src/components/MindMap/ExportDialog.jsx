import React, { useState } from 'react';

const ExportDialog = ({ isOpen, onClose, onExportPNG, onExportJSON }) => {
  const [tab, setTab] = useState('png');

  const [config, setConfig] = useState({
    background: 'theme',
    padding: 20,
    scale: 2
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (tab === 'json') {
        onExportJSON();
        onClose();
      } else {
        await onExportPNG(config);
        onClose();
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const tabStyle = (active) => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: active ? '2px solid #1890ff' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? '#1890ff' : '#666'
  });

  const optionBtn = (selected) => ({
    padding: '8px 16px',
    border: `1px solid ${selected ? '#1890ff' : '#d9d9d9'}`,
    borderRadius: 6,
    backgroundColor: selected ? '#f0f5ff' : '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: selected ? '#1890ff' : '#333'
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="내보내기"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
        zIndex: 2000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: '24px 32px',
          minWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333' }}>내보내기</h3>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e8e8e8', marginBottom: 20 }}>
          <button style={tabStyle(tab === 'png')} onClick={() => setTab('png')}>PNG 이미지</button>
          <button style={tabStyle(tab === 'json')} onClick={() => setTab('json')}>JSON 파일</button>
        </div>

        {tab === 'png' && (
          <>
            {/* 배경색 선택 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333', fontWeight: 500 }}>
                배경색
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'transparent', label: '투명' },
                  { value: 'white', label: '흰색' },
                  { value: 'theme', label: '현재 테마' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConfig({ ...config, background: option.value })}
                    style={optionBtn(config.background === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 여백 설정 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333', fontWeight: 500 }}>
                여백: {config.padding}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.padding}
                onChange={(e) => setConfig({ ...config, padding: parseInt(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 4 }}>
                <span>0px</span>
                <span>50px</span>
                <span>100px</span>
              </div>
            </div>

            {/* 해상도 배율 */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333', fontWeight: 500 }}>
                해상도 배율
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 1, label: '1x' },
                  { value: 2, label: '2x' },
                  { value: 3, label: '3x' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setConfig({ ...config, scale: option.value })}
                    style={optionBtn(config.scale === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                {config.scale === 1 && '일반 해상도'}
                {config.scale === 2 && '고해상도 (권장)'}
                {config.scale === 3 && '초고해상도'}
              </p>
            </div>
          </>
        )}

        {tab === 'json' && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              마인드맵을 JSON 파일로 내보냅니다.<br />
              다른 기기에서 가져오기로 불러올 수 있습니다.
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              color: '#333'
            }}
          >
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 6,
              backgroundColor: '#1890ff',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: 14,
              color: '#fff',
              fontWeight: 500
            }}
          >
            {isExporting ? '내보내는 중...' : '내보내기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;