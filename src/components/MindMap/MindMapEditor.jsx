import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MindMap from './MindMap';
import useMindMapStore from '../../store/MindMapStore';
import useFileManagerStore from '../../store/FileManagerStore';
import { createRootNode } from '../../types/NodeTypes';
import { calculateAutoLayout } from '../../utils/LayoutEngine';

const MindMapEditor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { loadFromStorage, setActiveDocumentId, mindMapData } = useMindMapStore();
  const fileManager = useFileManagerStore();

  useEffect(() => {
    fileManager.initialize();

    if (docId === 'new') {
      // 새 문서 생성
      const fmState = useFileManagerStore.getState();
      const newDocId = fmState.createDocument('마인드맵');
      const newRoot = createRootNode('마인드맵');
      const layouted = calculateAutoLayout(newRoot) || newRoot;
      useMindMapStore.getState().setMindMapData(layouted);
      // URL을 실제 docId로 변경
      navigate(`/editor/${newDocId}`, { replace: true });
      return;
    }

    // 기존 문서 로드
    const fmState = useFileManagerStore.getState();
    const doc = fmState.documents.find(d => d.id === docId);
    if (!doc) {
      navigate('/', { replace: true });
      return;
    }

    fmState.setActiveDocumentId(docId);
    useMindMapStore.getState().setActiveDocumentId(docId);
    const data = fmState.loadDocument(docId);
    if (data) {
      useMindMapStore.getState().setMindMapData(data);
    }
  }, [docId]);

  if (!mindMapData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return <MindMap />;
};

export default MindMapEditor;
