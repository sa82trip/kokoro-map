import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// 디버깅: 전역 에러 핸들러
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Filename:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('App starting...');

// 앱 렌더링 전 DOM 요소 확인
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: -apple-system, sans-serif;">
      <h1 style="color: red;">오류 발생</h1>
      <p>root 요소를 찾을 수 없습니다.</p>
      <p id="debug-info"></p>
    </div>
  `;
  document.getElementById('debug-info').textContent =
    `document.body: ${document.body ? '존재함' : '없음'}`;
} else {
  const root = ReactDOM.createRoot(rootElement);

  // 앱을 StrictMode 없이 렌더링하여 문제 단순화
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
