import React from 'react';
import MindMap from './components/MindMap/MindMap';
import './styles/MindMap.css';

// 초기 데이터 구조
const initialMindMapData = {
  id: 'root-node',
  text: '마인드맵',
  color: '#4A90E2',
  position: {
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 - 40
  },
  children: [],
  isRoot: true
};

function App() {
  return (
    <div className="App">
      <MindMap initialData={initialMindMapData} />
    </div>
  );
}

export default App;