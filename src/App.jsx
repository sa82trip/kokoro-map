import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/Home/HomeScreen';
import MindMapEditor from './components/MindMap/MindMapEditor';
import PasswordGuard from './components/Auth/PasswordGuard';
import './styles/MindMap.css';

function App() {
  return (
    <PasswordGuard>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/editor/:docId" element={<MindMapEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </PasswordGuard>
  );
}

export default App;
