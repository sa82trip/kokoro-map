import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/Home/HomeScreen';
import MindMapEditor from './components/MindMap/MindMapEditor';
import PasswordGuard from './components/Auth/PasswordGuard';
import './styles/MindMap.css';

// 글로벌 로딩 상태 컴포넌트
const GlobalLoading = () => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // 일정 시간 후에 fallback을 표시 (SSR에서의 렌더링 차이 처리)
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (showFallback) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>앱 로딩 중...</p>
      </div>
    );
  }

  return null;
};

// 컴포넌트별 로딩 컴포넌트
const ComponentLoading = () => (
  <div className="component-loading">
    <div className="loading-spinner" />
    <p>페이지 로딩 중...</p>
  </div>
);

function App() {
  return (
    <PasswordGuard>
      <div className="App">
        <Suspense fallback={<GlobalLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<ComponentLoading />}>
                  <HomeScreen />
                </Suspense>
              }
            />
            <Route
              path="/editor/:docId"
              element={
                <Suspense fallback={<ComponentLoading />}>
                  <MindMapEditor />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </PasswordGuard>
  );
}

export default App;
