import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useMindMapStore from '../../store/MindMapStore';
import useFileManagerStore from '../../store/FileManagerStore';
import { exportToJSON, exportToPNG } from '../../utils/FileExporter';
import { openFilePicker } from '../../utils/FileImporter';
import { COLOR_PALETTE } from '../../types/NodeTypes';
import ZoomControls from '../../components/ZoomControls';
import ExportDialog from './ExportDialog';

const Toolbar = () => {
  const navigate = useNavigate();
  const {
    mindMapData,
    createNewMindMap,
    updateMindMapTitle,
    applyAutoLayout,
    resetLayout,
    connectionStyle,
    setConnectionStyle,
    connectionColor,
    setConnectionColor,
    connectionArrow,
    setConnectionArrow,
    connectionDashed,
    setConnectionDashed,
    connectionWidth,
    setConnectionWidth,
    connectionColorMode,
    setConnectionColorMode,
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

  // Undo/Redo 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 입력 필드에서는 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleClick = () => {
    setTitleText(title);
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = () => {
    const trimmed = titleText.trim();
    if (trimmed) {
      updateMindMapTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleNewMindMap = () => {
    if (mindMapData?.children?.length > 0) {
      setShowNewConfirm(true);
    } else {
      createNewMindMap();
    }
  };

  const confirmNewMindMap = () => {
    createNewMindMap();
    setShowNewConfirm(false);
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

  const showNotification = (message, type = 'success') => {
    // 간단한 알림 표시 (임시)
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: ${type === 'success' ? '#52c41a' : '#ff4d4f'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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

  const toolbarStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderBottom: '1px solid #e0e4ea',
    zIndex: 100,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)'
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1a1a2e',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: 6,
    border: isEditingTitle ? '2px solid #4A90E2' : '2px solid transparent',
    outline: 'none',
    background: isEditingTitle ? '#fff' : 'transparent',
    minWidth: 120,
    maxWidth: 400,
    transition: 'border-color 0.2s ease'
  };

  const buttonBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s ease'
  };

  return (
    <div style={toolbarStyle} data-testid="toolbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/')}
          title="홈으로"
          data-testid="btn-home"
          style={{
            ...buttonBase,
            padding: '6px 10px',
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
          onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
        >
          &#8592; 홈
        </button>
        <div style={{ fontSize: 22, marginRight: 4 }}>&#129504;</div>
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
            data-testid="toolbar-title"
          >
            {title}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2',
            opacity: canUndo() ? 1 : 0.4,
            cursor: canUndo() ? 'pointer' : 'not-allowed'
          }}
          onClick={undo}
          disabled={!canUndo()}
          title="실행 취소 (Ctrl+Z)"
          data-testid="btn-undo"
        >
          &#8630; 취소
        </button>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2',
            opacity: canRedo() ? 1 : 0.4,
            cursor: canRedo() ? 'pointer' : 'not-allowed'
          }}
          onClick={redo}
          disabled={!canRedo()}
          title="다시 실행 (Ctrl+Shift+Z)"
          data-testid="btn-redo"
        >
          &#8631; 되돌리기
        </button>
        <button
          style={{
            ...buttonBase,
            background: saveFeedback ? '#d4edda' : '#f0f4ff',
            color: saveFeedback ? '#155724' : '#4A90E2'
          }}
          onClick={handleSave}
          title="저장 (Ctrl+S)"
          data-testid="btn-save"
        >
          {saveFeedback ? '✓ 저장됨' : '💾 저장'}
        </button>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => setShowExportDialog(true)}
          title="내보내기"
          data-testid="btn-export"
          onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
          onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
        >
          📤 내보내기
        </button>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={handleImport}
          title="JSON 가져오기"
          data-testid="btn-import"
          onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
          onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
        >
          📥 가져오기
        </button>
        <button
          style={{
            ...buttonBase,
            background: showSettings ? '#dde5f7' : '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={() => setShowSettings(!showSettings)}
          title="설정"
          data-testid="btn-settings"
        >
          &#9881; 설정
        </button>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={applyAutoLayout}
          title="자동 레이아웃"
          data-testid="btn-auto-layout"
          onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
          onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
        >
          &#9878; 자동 정렬
        </button>
        <button
          style={{
            ...buttonBase,
            background: '#f0f4ff',
            color: '#4A90E2'
          }}
          onClick={resetLayout}
          title="레이아웃 재조정"
          data-testid="btn-reset-layout"
          onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
          onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
        >
          &#8634; 재조정
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ZoomControls className="toolbar" />
          <button
            style={{
              ...buttonBase,
              background: '#f0f4ff',
              color: '#4A90E2'
            }}
            onClick={resetViewport}
            title="화면 초기 위치"
            data-testid="btn-reset-viewport"
            onMouseEnter={(e) => e.target.style.background = '#dde5f7'}
            onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
          >
            &#8862; 중앙 이동
          </button>
        </div>
        <button
          style={{
            ...buttonBase,
            background: '#4A90E2',
            color: '#fff'
          }}
          onClick={handleNewMindMap}
          title="새 마인드맵"
          data-testid="btn-new-mindmap"
          onMouseEnter={(e) => e.target.style.background = '#357abd'}
          onMouseLeave={(e) => e.target.style.background = '#4A90E2'}
        >
          + 새 마인드맵
        </button>
      </div>

      {showSettings && (
        <div
          data-testid="settings-panel"
          style={{
            position: 'absolute',
            top: 52,
            right: 20,
            background: '#fff',
            borderRadius: 10,
            padding: 16,
            minWidth: 280,
            maxHeight: 'calc(100vh - 70px)',
            overflowY: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid #e0e4ea',
            zIndex: 200
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1a1a2e' }}>설정</div>

          {/* 연결선 스타일 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>연결선 스타일</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                data-testid="btn-connection-bezier"
                onClick={() => setConnectionStyle('bezier')}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionStyle === 'bezier' ? '#4A90E2' : '#f0f0f0',
                  color: connectionStyle === 'bezier' ? '#fff' : '#333'
                }}
              >
                곡선
              </button>
              <button
                data-testid="btn-connection-straight"
                onClick={() => setConnectionStyle('straight')}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionStyle === 'straight' ? '#4A90E2' : '#f0f0f0',
                  color: connectionStyle === 'straight' ? '#fff' : '#333'
                }}
              >
                직선
              </button>
            </div>
          </div>

          {/* 연결선 색상 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>연결선 색상</div>
            <div style={{
              display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 220,
              opacity: connectionColorMode === 'branch' ? 0.3 : 1,
              pointerEvents: connectionColorMode === 'branch' ? 'none' : 'auto'
            }}>
              {COLOR_PALETTE.slice(0, 16).map((color) => (
                <div
                  key={color}
                  data-testid={`conn-color-${color.replace('#', '')}`}
                  onClick={() => setConnectionColor(color)}
                  style={{
                    width: 16, height: 16, borderRadius: '50%', cursor: 'pointer',
                    background: color,
                    border: connectionColor === color ? '2px solid #1890ff' : '1px solid #ccc',
                  }}
                />
              ))}
            </div>
            {connectionColorMode === 'branch' && (
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>노드 색상 상속 모드</div>
            )}
          </div>

          {/* 화살표 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>화살표</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                data-testid="btn-arrow-off"
                onClick={() => setConnectionArrow(false)}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: !connectionArrow ? '#4A90E2' : '#f0f0f0',
                  color: !connectionArrow ? '#fff' : '#333'
                }}
              >
                없음
              </button>
              <button
                data-testid="btn-arrow-on"
                onClick={() => setConnectionArrow(true)}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionArrow ? '#4A90E2' : '#f0f0f0',
                  color: connectionArrow ? '#fff' : '#333'
                }}
              >
                표시
              </button>
            </div>
          </div>

          {/* 점선 스타일 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>점선 스타일</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                data-testid="btn-dashed-off"
                onClick={() => setConnectionDashed(false)}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: !connectionDashed ? '#4A90E2' : '#f0f0f0',
                  color: !connectionDashed ? '#fff' : '#333'
                }}
              >
                실선
              </button>
              <button
                data-testid="btn-dashed-on"
                onClick={() => setConnectionDashed(true)}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionDashed ? '#4A90E2' : '#f0f0f0',
                  color: connectionDashed ? '#fff' : '#333'
                }}
              >
                점선
              </button>
            </div>
          </div>

          {/* 연결선 두께 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              연결선 두께: {connectionWidth}px
            </div>
            <input
              data-testid="connection-width-slider"
              type="range"
              min={1} max={5} step={1}
              value={connectionWidth}
              onChange={(e) => setConnectionWidth(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* 색상 모드 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>색상 모드</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                data-testid="btn-color-mode-global"
                onClick={() => setConnectionColorMode('global')}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionColorMode === 'global' ? '#4A90E2' : '#f0f0f0',
                  color: connectionColorMode === 'global' ? '#fff' : '#333'
                }}
              >
                전역
              </button>
              <button
                data-testid="btn-color-mode-branch"
                onClick={() => setConnectionColorMode('branch')}
                style={{
                  ...buttonBase,
                  fontSize: 12,
                  padding: '4px 10px',
                  background: connectionColorMode === 'branch' ? '#4A90E2' : '#f0f0f0',
                  color: connectionColorMode === 'branch' ? '#fff' : '#333'
                }}
              >
                브랜치
              </button>
            </div>
          </div>

          {/* 수평 간격 */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              수평 간격: {layoutConfig.horizontalGap}px
            </div>
            <input
              data-testid="hgap-slider"
              type="range"
              min={20} max={500}
              value={layoutConfig.horizontalGap}
              onChange={(e) => setLayoutConfig({ horizontalGap: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          {/* 수직 간격 */}
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              수직 간격: {layoutConfig.verticalGap}px
            </div>
            <input
              data-testid="vgap-slider"
              type="range"
              min={20} max={500}
              value={layoutConfig.verticalGap}
              onChange={(e) => setLayoutConfig({ verticalGap: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {showNewConfirm && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 80,
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 360,
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
                style={{ ...buttonBase, background: '#f0f0f0', color: '#333' }}
                onClick={() => setShowNewConfirm(false)}
              >
                취소
              </button>
              <button
                style={{ ...buttonBase, background: '#e74c3c', color: '#fff' }}
                onClick={confirmNewMindMap}
              >
                생성
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ExportDialog — Portal로 body에 렌더링 */}
      {showExportDialog && createPortal(
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          onExportPNG={handleExportPNG}
          onExportJSON={handleExport}
        />,
        document.body
      )}

      {/* 알림 CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Toolbar;
