import React, { useEffect } from 'react';
import MindMapContainer from './MindMapContainer';
import Toolbar from './Toolbar';
import useMindMapStore from '../../store/MindMapStore';
import '../../styles/MindMap.css';

const MindMap = ({ initialData = null }) => {
  const {
    mindMapData,
    loading,
    error,
    setMindMapData,
    loadFromStorage,
    createNewMindMap
  } = useMindMapStore();

  // 초기 데이터 설정: localStorage 우선, 없으면 initialData
  useEffect(() => {
    const loaded = loadFromStorage();
    if (!loaded && initialData) {
      setMindMapData(initialData);
    }
  }, []);

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
    </div>
  );
};

export default MindMap;
