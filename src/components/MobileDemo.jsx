import React, { useState, useEffect } from 'react';
import { useIsMobile, useTouchSupport } from './MobileDetector';

const MobileDemo = () => {
  const { isMobile, deviceType, screenSize } = useIsMobile();
  const hasTouchSupport = useTouchSupport();
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouch, setLastTouch] = useState(null);

  const handleTouchStart = (e) => {
    setTouchCount(e.touches.length);
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setLastTouch({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setTouchCount(0);
  };

  return (
    <div style={{
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      touchAction: 'none'
    }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      <h1 style={{ color: '#333', marginBottom: 20 }}>
        모바일 대응 데모
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>디바이스 정보</h2>
        <p><strong>모바일:</strong> {isMobile ? '✅' : '❌'}</p>
        <p><strong>디바이스 타입:</strong> {deviceType}</p>
        <p><strong>터치 지원:</strong> {hasTouchSupport ? '✅' : '❌'}</p>
        <p><strong>화면 크기:</strong> {screenSize.width} × {screenSize.height}px</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>터치 테스트</h2>
        <p><strong>터치 포인트:</strong> {touchCount}</p>
        {lastTouch && (
          <p><strong>마지막 터치 위치:</strong> ({lastTouch.x}, {lastTouch.y})</p>
        )}
        <p style={{ marginTop: 10, color: '#666' }}>
          화면을 터치해 보세요. 두 손가락으로 핀치 동작도 테스트해 보세요.
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>기능 안내</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>단일 터치:</strong> 마인드맵 패닝 (이동)</li>
          <li><strong>더블 탭:</strong> 뷰포트 중앙으로 이동</li>
          <li><strong>두 손가락:</strong> 핀치 줌/아웃</li>
          <li><strong>모바일 툴바:</strong> 하단에 표시됩니다</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: isMobile ? '#e3f2fd' : '#f3e5f5',
        padding: 20,
        borderRadius: 8,
        marginBottom: 20,
        border: `2px solid ${isMobile ? '#2196f3' : '#9c27b0'}`,
        textAlign: 'center'
      }}>
        <h3 style={{ color: isMobile ? '#1976d2' : '#7b1fa2' }}>
          {isMobile ? '📱 모바일 모드' : '💻 데스크톱 모드'}
        </h3>
        <p>
          {isMobile
            ? '모바일에서는 하단 툴바가 나타나며, 터치에 최적화되어 있습니다.'
            : '데스크톱에서는 기존 마우스 인터페이스를 사용합니다.'
          }
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 20,
        marginTop: 20
      }}>
        {[
          { title: '반응형 레이아웃', desc: '화면 크기에 따라 UI 자동 조정' },
          { title: '터치 인식', desc: '정확한 터치 이벤트 처리' },
          { title: '핀치 줌', desc: '두 손가락으로 확대/축소' },
          { title: '모바일 툴바', desc: '손가락 친화적인 큰 버튼' }
        ].map((feature, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ color: '#333', marginBottom: 8 }}>{feature.title}</h4>
            <p style={{ color: '#666', fontSize: 14 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileDemo;