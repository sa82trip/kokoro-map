import React, { useEffect, useState } from 'react';
import MindMapContainer from './MindMapContainer';
import Toolbar from './Toolbar';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import useMindMapStore from '../../store/MindMapStore';
import useFileManagerStore from '../../store/FileManagerStore';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { version } from '../../../package.json';
import '../../styles/MindMap.css';

const MindMapClient = ({ initialData = null }) => {
  const {
    mindMapData,
    loading,
    error,
    setMindMapData,
    loadFromStorage,
    createNewMindMap
  } = useMindMapStore();

  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  // 클라이언트 사이드에서만 실행되는 초기화 로직
  useEffect(() => {
    console.log('MindMap: Starting client-side initialization');

    const initializeAsync = async () => {
      try {
        const fileManager = useFileManagerStore.getState();

        // FileManagerStore 초기화
        if (!fileManager.initialized) {
          console.log('MindMap: Initializing FileManager');
          fileManager.initialize();
        }

        // 데이터 로드
        console.log('MindMap: Loading from storage');
        const loaded = loadFromStorage();
        console.log('MindMap: Load result:', loaded);

        // 데이터가 없고 initialData도 없으면 새 마인드맵 생성
        if (!loaded && !initialData) {
          console.log('MindMap: Creating new mind map');
          createNewMindMap();
        } else if (initialData) {
          console.log('MindMap: Using initial data');
          setMindMapData(initialData);
        }
      } catch (error) {
        console.error('MindMap initialization error:', error);
      }
    };

    initializeAsync();
  }, [initialData]);

  // 데이터 로딩 상태 처리
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // 에러 처리 — 에러 배너로 표시, MindMap은 계속 렌더링
  return (
    <div className="mindmap-wrapper">
      {error && (
        <div style={{
          position: 'absolute', top: 52, left: 0, right: 0, zIndex: 150,
          background: '#fff2f0', borderBottom: '1px solid #ffa39e',
          padding: '6px 20px', fontSize: 13, color: '#cf1322',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => useMindMapStore.getState().setError(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#cf1322' }}
          >
            ✕
          </button>
        </div>
      )}
      <Toolbar />
      <MindMapContainer data={mindMapData} />
      {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        padding: '6px 0', zIndex: 50, pointerEvents: 'none'
      }}>
        <span style={{ fontSize: 11, color: '#999' }}>v{version}</span>
      </div>
    </div>
  );
};

export default MindMapClient;