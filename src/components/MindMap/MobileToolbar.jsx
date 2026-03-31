import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useMindMapStore from '../../store/MindMapStore';
import useFileManagerStore from '../../store/FileManagerStore';
import { exportToJSON, exportToPNG } from '../../utils/FileExporter';
import { openFilePicker } from '../../utils/FileImporter';
import { COLOR_PALETTE } from '../../types/NodeTypes';
import ZoomControls from '../../components/ZoomControls';
import ExportDialog from './ExportDialog';

const MobileToolbar = ({ mindMapData }) => {
  const navigate = useNavigate();
  const {
    createNewMindMap,
    updateMindMapTitle,
    applyAutoLayout,
    resetLayout,
    connectionConfig,
    setConnectionConfig,
    layoutConfig,
    setLayoutConfig,
    resetViewport,
    resetZoom,
    undo,
    redo,
    canUndo,
    canRedo
  } = useMindMapStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const titleInputRef = useRef(null);

  const title = mindMapData?.text || '마인드맵';

  const handleTitleClick = () => {
    setTitleText(title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSubmit = () => {
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== title) {
      updateMindMapTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const confirmNewMindMap = () => {
    createNewMindMap();
    setShowNewConfirm(false);
  };

  // 터치 이벤트 핸들러
  const handleTouchAction = (action) => {
    // 최소 탭 크기 보장을 위한 디바운스
    if (window.touchActionBlocked) return;
    window.touchActionBlocked = true;
    setTimeout(() => { window.touchActionBlocked = false; }, 100);

    switch (action) {
      case 'undo':
        if (canUndo()) undo();
        break;
      case 'redo':
        if (canRedo()) redo();
        break;
      case 'new':
        if (mindMapData?.children?.length > 0) {
          setShowNewConfirm(true);
        } else {
          createNewMindMap();
        }
        break;
      case 'save':
        handleSave();
        break;
      case 'export':
        setShowExportDialog(true);
        break;
      case 'import':
        handleImport();
        break;
      case 'settings':
        setShowSettings(!showSettings);
        break;
      case 'layout':
        applyAutoLayout();
        break;
      case 'reset':
        resetLayout();
        break;
      case 'zoom':
        setShowSettings(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (mindMapData) {
      const fm = useFileManagerStore.getState();
      fm.saveActiveDocument(mindMapData);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1000);
    }
  };

  const handleExport = () => {
    if (mindMapData) {
      const fm = useFileManagerStore.getState();
      const meta = fm.getActiveDocumentMeta();
      exportToJSON(mindMapData, meta);
    }
  };

  const handleExportPNG = async (config) => {
    if (!mindMapData) return;

    const mindMapContainer = document.getElementById('mindmap-container');
    if (!mindMapContainer) return;

    try {
      const { filename } = await exportToPNG(mindMapContainer, config);
      showNotification(`PNG 이미지 "${filename}"가 저장되었습니다.`);
    } catch (error) {
      showNotification('내보내기에 실패했습니다.', 'error');
      console.error('Export failed:', error);
    }
  };

  const handleImport = async () => {
    const result = await openFilePicker();
    if (result.success) {
      const fm = useFileManagerStore.getState();
      const docId = fm.createDocument(result.meta.title || '가져온 마인드맵', result.data);
      const store = useMindMapStore.getState();
      store.setMindMapData(result.data);
      store.setActiveDocumentId(docId);
    } else if (result.errors && result.errors.length > 0) {
      useMindMapStore.getState().setError(result.errors.join('\n'));
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#52c41a' : '#ff4d4f'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      font-size: 14px;
      font-weight: 500;
      animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  // 모바일 스타일
  const toolbarStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.98)',
    borderBottom: '1px solid #e0e4ea',
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid #f0f0f0',
    height: '48px'
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1a1a2e',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: 8,
    border: isEditingTitle ? '2px solid #4A90E2' : '2px solid transparent',
    outline: 'none',
    background: isEditingTitle ? '#fff' : 'transparent',
    minWidth: 100,
    maxWidth: 300,
    transition: 'border-color 0.2s ease'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: 20,
    background: 'transparent'
  };

  const quickActionsStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.98)',
    borderTop: '1px solid #e0e4ea',
    overflowX: 'auto'
  };

  const settingsPanelStyle = {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    background: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 16,
    maxHeight: 'calc(100vh - 70px)',
    overflowY: 'auto',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
    border: '1px solid #e0e4ea',
    zIndex: 200,
    paddingBottom: 80 // 바텀 스페이스
  };

  return (
    <div style={toolbarStyle} data-testid="mobile-toolbar">
      {/* 헤더 */}
      <div style={headerStyle}>
        <button
          style={buttonStyle}
          onClick={() => navigate('/')}
          title="홈으로"
        >
          &#8592;
        </button>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            style={titleStyle}
            maxLength={200}
          />
        ) : (
          <span
            style={titleStyle}
            onClick={handleTitleClick}
            title="클릭하여 제목 편집"
          >
            {title}
          </span>
        )}
        <button
          style={{
            ...buttonStyle,
            background: showSettings ? '#f0f0f0' : 'transparent'
          }}
          onClick={() => setShowSettings(!showSettings)}
          title="설정"
        >
          &#9881;
        </button>
      </div>

      {/* 퀵 액션 바 */}
      <div style={quickActionsStyle}>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('undo')}
          disabled={!canUndo()}
          title="실행 취소"
        >
          &#8630;
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('redo')}
          disabled={!canRedo()}
          title="다시 실행"
        >
          &#8631;
        </button>
        <button
          style={{
            ...buttonStyle,
            background: saveFeedback ? '#d4edda' : '#f0f4ff',
            color: saveFeedback ? '#155724' : '#4A90E2'
          }}
          onClick={() => handleTouchAction('save')}
          title="저장"
        >
          💾
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('export')}
          title="내보내기"
        >
          📤
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('import')}
          title="가져오기"
        >
          📥
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('layout')}
          title="자동 정렬"
        >
          &#9878;
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => handleTouchAction('reset')}
          title="재조정"
        >
          &#8634;
        </button>
        <button
          style={{
            ...buttonStyle,
            background: '#4A90E2',
            color: '#fff'
          }}
          onClick={() => handleTouchAction('new')}
          title="새 마인드맵"
        >
          +
        </button>
      </div>

      {/* 설정 패널 */}
      {showSettings && createPortal(
        <div style={settingsPanelStyle}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1a1a2e' }}>설정</div>

          {/* 연결선 스타일 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>연결선 스타일</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: connectionConfig.style === 'bezier' ? '#4A90E2' : '#f0f0f0',
                  color: connectionConfig.style === 'bezier' ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ style: 'bezier' })}
              >
                곡선
              </button>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: connectionConfig.style === 'straight' ? '#4A90E2' : '#f0f0f0',
                  color: connectionConfig.style === 'straight' ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ style: 'straight' })}
              >
                직선
              </button>
            </div>
          </div>

          {/* 화살표 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>화살표</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: !connectionConfig.arrow ? '#4A90E2' : '#f0f0f0',
                  color: !connectionConfig.arrow ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ arrow: false })}
              >
                없음
              </button>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: connectionConfig.arrow ? '#4A90E2' : '#f0f0f0',
                  color: connectionConfig.arrow ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ arrow: true })}
              >
                표시
              </button>
            </div>
          </div>

          {/* 점선 스타일 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>점선 스타일</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: !connectionConfig.dashed ? '#4A90E2' : '#f0f0f0',
                  color: !connectionConfig.dashed ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ dashed: false })}
              >
                실선
              </button>
              <button
                style={{
                  ...buttonStyle,
                  width: 56,
                  height: 40,
                  fontSize: 12,
                  padding: 8,
                  background: connectionConfig.dashed ? '#4A90E2' : '#f0f0f0',
                  color: connectionConfig.dashed ? '#fff' : '#333'
                }}
                onClick={() => setConnectionConfig({ dashed: true })}
              >
                점선
              </button>
            </div>
          </div>

          {/* 연결선 두께 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              연결선 두께: {connectionConfig.thickness}px
            </div>
            <input
              type="range"
              min={1} max={5} step={1}
              value={connectionConfig.thickness}
              onChange={(e) => setConnectionConfig({ thickness: Number(e.target.value) })}
              style={{ width: '100%', height: 6, borderRadius: 3 }}
            />
          </div>

          {/* 수평 간격 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              수평 간격: {layoutConfig.horizontalGap}px
            </div>
            <input
              type="range"
              min={20} max={200}
              value={layoutConfig.horizontalGap}
              onChange={(e) => setLayoutConfig({ horizontalGap: Number(e.target.value) })}
              style={{ width: '100%', height: 6, borderRadius: 3 }}
            />
          </div>

          {/* 수직 간격 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              수직 간격: {layoutConfig.verticalGap}px
            </div>
            <input
              type="range"
              min={20} max={200}
              value={layoutConfig.verticalGap}
              onChange={(e) => setLayoutConfig({ verticalGap: Number(e.target.value) })}
              style={{ width: '100%', height: 6, borderRadius: 3 }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* 배율 조절 - 플로팅 */}
      {createPortal(
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 16,
          zIndex: 900
        }}>
          <ZoomControls />
        </div>,
        document.body
      )}

      {/* ExportDialog */}
      {showExportDialog && createPortal(
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExportPNG={handleExportPNG}
          onExportJSON={handleExport}
        />,
        document.body
      )}

      {/* 새 마인드맵 확인 */}
      {showNewConfirm && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 80,
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 320,
            margin: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1a1a2e' }}>
              새 마인드맵을 생성하시겠습니까?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              현재 마인드맵의 모든 내용이 삭제됩니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                style={{
                  ...buttonStyle,
                  width: 80,
                  height: 40,
                  background: '#f0f0f0',
                  color: '#333'
                }}
                onClick={() => setShowNewConfirm(false)}
              >
                취소
              </button>
              <button
                style={{
                  ...buttonStyle,
                  width: 80,
                  height: 40,
                  background: '#e74c3c',
                  color: '#fff'
                }}
                onClick={confirmNewMindMap}
              >
                생성
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 애니메이션 CSS */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MobileToolbar;