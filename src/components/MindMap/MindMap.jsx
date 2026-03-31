import React, { Suspense, lazy } from 'react';

// 클라이언트 전용 컴포넌트 동적 로드
const MindMapClient = lazy(() => import('./MindMapClient'));

const MindMap = ({ initialData = null }) => {
  // 서버 사이드에서는 로딩 상태만 표시
  if (typeof window === 'undefined') {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // 클라이언트 사이드에서는 Suspense로 감싸서 렌더링
  return (
    <React.Suspense fallback={
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
        <p style={{ marginTop: 20, color: '#666' }}>Initializing...</p>
      </div>
    }>
      <MindMapClient initialData={initialData} />
    </React.Suspense>
  );
};

export default MindMap;
