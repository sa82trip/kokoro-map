import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeScreen from './components/Home/HomeScreen';
import MindMapEditor from './components/MindMap/MindMapEditor';
import './styles/MindMap.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/editor/:docId" element={<MindMapEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
