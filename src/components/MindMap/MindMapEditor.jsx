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
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      try {
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
      } catch (error) {
        console.error('MindMapEditor: Error loading document', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [docId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>문서 로딩 중...</p>
      </div>
    );
  }

  if (!mindMapData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return <MindMap />;
};

export default MindMapEditor;
