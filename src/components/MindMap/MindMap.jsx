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

  // 에러 처리
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mindmap-wrapper">
      <Toolbar />
      <MindMapContainer data={mindMapData} />
    </div>
  );
};

export default MindMap;
