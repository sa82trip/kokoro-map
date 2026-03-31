import { useState, useRef, useEffect } from 'react';

const TOUCH_SMOOTHING = 0.2;
const MIN_PINCH_DISTANCE = 10;
const DOUBLE_TAP_DELAY = 300;
const LONG_PRESS_DELAY = 500;

export const useTouch = (options = {}) => {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    onPinchStart,
    onPinch,
    onPinchEnd,
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    enabled = true
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [touches, setTouches] = useState({});

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragVelocityRef = useRef({ x: 0, y: 0 });
  const lastDragTimeRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const longPressTimeoutRef = useRef(null);

  // 초기 터치 포인트 저장
  const handleTouchStart = (e) => {
    if (!enabled) return;

    // iOS Safari에서 preventDefault가 필요한 경우에만 호출
    if (e.touches.length === 1) {
      e.preventDefault();
    }
    const now = Date.now();
    const newTouches = {};

    Array.from(e.touches).forEach(touch => {
      newTouches[touch.identifier] = {
        x: touch.clientX,
        y: touch.clientY,
        startTime: now,
        element: touch.target
      };
    });

    setTouches(newTouches);

    // 한 손가락 터치
    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // 더블 탭 체크
      if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
        if (onDoubleTap) {
          onDoubleTap(touch);
        }
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;

        // 롱 프레스 타이머
        if (onLongPress) {
          longPressTimeoutRef.current = setTimeout(() => {
            onLongPress(touch);
            longPressTimeoutRef.current = null;
          }, LONG_PRESS_DELAY);
        }

        // 탭
        tapTimeoutRef.current = setTimeout(() => {
          if (onTap) {
            onTap(touch);
          }
          tapTimeoutRef.current = null;
        }, DOUBLE_TAP_DELAY);
      }

      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      lastDragTimeRef.current = now;
      setIsDragging(true);

      if (onDragStart) {
        onDragStart(touch);
      }
    }

    // 두 손가락 터치 (핀치 시작)
    if (e.touches.length === 2) {
      if (onPinchStart) {
        onPinchStart(e.touches);
      }
      setIsPinching(true);
    }
  };

  // 터치 이동
  const handleTouchMove = (e) => {
    if (!enabled) return;

    // iOS Safari에서 preventDefault가 필요한 경우에만 호출
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
    }
    const now = Date.now();

    // 드래그 중
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;

      // 속도 계산 (가장근접한 두 프레임)
      const timeDelta = now - lastDragTimeRef.current;
      if (timeDelta > 0) {
        dragVelocityRef.current = {
          x: deltaX / timeDelta,
          y: deltaY / timeDelta
        };
      }
      lastDragTimeRef.current = now;

      if (onDrag) {
        onDrag({
          touch,
          deltaX,
          deltaY,
          velocity: dragVelocityRef.current,
          isSmooth: timeDelta < 16 // 60fps 기준
        });
      }

      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    }

    // 핀치 중
    if (isPinching && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // 거리 계산
      const deltaX = touch2.clientX - touch1.clientX;
      const deltaY = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 각도 계산
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

      // 센터 포인트
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      if (onPinch) {
        onPinch({
          touch1,
          touch2,
          distance,
          angle,
          centerX,
          centerY,
          scale: distance / (touches[touch1.identifier]?.initialDistance || distance)
        });
      }

      // 초기 거리 저장
      if (!touches[touch1.identifier]?.initialDistance) {
        setTouches(prev => ({
          ...prev,
          [touch1.identifier]: {
            ...prev[touch1.identifier],
            initialDistance: distance,
            initialAngle: angle
          },
          [touch2.identifier]: {
            ...prev[touch2.identifier],
            initialDistance: distance,
            initialAngle: angle
          }
        }));
      }
    }

    // 스와이프 감지
    if (e.touches.length === 1 && now - lastTapTimeRef.current > DOUBLE_TAP_DELAY) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 50 && onSwipe) {
        const threshold = 30;
        if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
          onSwipe({
            touch,
            direction: deltaX > 0 ? 'right' : 'left',
            distance: Math.abs(deltaX)
          });
        } else if (Math.abs(deltaY) > threshold) {
          onSwipe({
            touch,
            direction: deltaY > 0 ? 'down' : 'up',
            distance: Math.abs(deltaY)
          });
        }
      }
    }
  };

  // 터치 종료
  const handleTouchEnd = (e) => {
    if (!enabled) return;

    e.preventDefault();

    // 롱 프레스 취소
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // 탑 타임아웃 취소
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    const activeTouchIds = Array.from(e.touches).map(t => t.identifier);
    const endedTouchIds = Object.keys(touches).filter(id => !activeTouchIds.includes(id));

    // 드래그 종료
    if (isDragging && endedTouchIds.length > 0) {
      setIsDragging(false);

      if (onDragEnd) {
        onDragEnd({
          velocity: dragVelocityRef.current,
          endedTouches: endedTouchIds.map(id => touches[id])
        });
      }

      // 모멘텀 효과
      const velocity = dragVelocityRef.current;
      if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
        // 애니메이션 프레임으로 모멘텀 구현
        let momentumX = 0;
        let momentumY = 0;
        let lastX = dragStartRef.current.x;
        let lastY = dragStartRef.current.y;
        let lastTime = Date.now();

        const animateMomentum = () => {
          const now = Date.now();
          const deltaTime = now - lastTime;

          if (deltaTime > 0) {
            momentumX = velocity.x * TOUCH_SMOOTHING;
            momentumY = velocity.y * TOUCH_SMOOTHING;

            if (Math.abs(momentumX) > 0.1 || Math.abs(momentumY) > 0.1) {
              // 여기서 상태 업데이트를 props로 전달
              lastX += momentumX * deltaTime;
              lastY += momentumY * deltaTime;

              if (onDrag) {
                onDrag({
                  momentum: true,
                  deltaX: momentumX,
                  deltaY: momentumY,
                  velocity: {
                    x: momentumX * (1 - TOUCH_SMOOTHING),
                    y: momentumY * (1 - TOUCH_SMOOTHING)
                  }
                });
              }

              velocity.x = momentumX;
              velocity.y = momentumY;
              lastTime = now;

              requestAnimationFrame(animateMomentum);
            }
          }
        };

        animateMomentum();
      }
    }

    // 핀치 종료
    if (isPinching && e.touches.length < 2) {
      setIsPinching(false);
      if (onPinchEnd) {
        onPinchEnd();
      }
    }

    // 터치 정보 업데이트
    const newTouches = { ...touches };
    endedTouchIds.forEach(id => {
      delete newTouches[id];
    });

    // 남아있는 터치 업데이트
    Array.from(e.touches).forEach(touch => {
      if (newTouches[touch.identifier]) {
        newTouches[touch.identifier] = {
          ...newTouches[touch.identifier],
          x: touch.clientX,
          y: touch.clientY
        };
      }
    });

    setTouches(newTouches);
  };

  // 터치 취소
  const handleTouchCancel = (e) => {
    handleTouchEnd(e);
  };

  // 이벤트 리스너 부착
  useEffect(() => {
    const element = options.element || window;

    if (enabled) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('touchcancel', handleTouchCancel);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);

      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [enabled, onDragStart, onDrag, onDragEnd]);

  return {
    isDragging,
    isPinching,
    touches,
    dragVelocity: dragVelocityRef.current,
    bindTouch: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    }
  };
};