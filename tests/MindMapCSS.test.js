// CSS 스타일 테스트
describe('MindMap CSS Styles', () => {
  beforeEach(() => {
    // CSS 파일을 로드하기 위한 헤드 설정
    document.head.innerHTML = `
      <style>
        .mindmap-wrapper {
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .mindmap-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          overflow: hidden;
        }

        .node {
          position: absolute;
          width: 200px;
          height: 80px;
          background-color: #4A90E2;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: move;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          user-select: none;
        }

        .node:hover {
          transform: scale(1.05);
        }

        .node.dragging {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 768px) {
          .mindmap-wrapper {
            transform: scale(0.8);
            transform-origin: center top;
          }
        }
      </style>
    `;
  });

  test('mindmap-wrapper 클래스가 올바른 스타일을 가져야 합니다', () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mindmap-wrapper';
    document.body.appendChild(wrapper);

    const styles = window.getComputedStyle(wrapper);

    expect(styles.width).toBe('100%');
    expect(styles.height).toBe('100vh');
    expect(styles.position).toBe('relative');
    expect(styles.overflow).toBe('hidden');
  });

  test('mindmap-container 클래스가 올바른 배경 그라데이션을 가져야 합니다', () => {
    const container = document.createElement('div');
    container.className = 'mindmap-container';
    document.body.appendChild(container);

    const styles = window.getComputedStyle(container);

    expect(styles.background).toContain('linear-gradient');
    expect(styles.background).toContain('#f5f7fa');
    expect(styles.background).toContain('#c3cfe2');
  });

  test('노드 기본 스타일이 올바르게 적용되어야 합니다', () => {
    const node = document.createElement('div');
    node.className = 'node';
    document.body.appendChild(node);

    const styles = window.getComputedStyle(node);

    expect(styles.width).toBe('200px');
    expect(styles.height).toBe('80px');
    expect(styles.backgroundColor).toBe('rgb(74, 144, 226)');
    expect(styles.borderRadius).toBe('16px');
    expect(styles.cursor).toBe('move');
    expect(styles.boxShadow).toBe('rgb(0, 0, 0) 4px 4px 12px');
  });

  test('노드 hover 시 확대 효과가 적용되어야 합니다', () => {
    const node = document.createElement('div');
    node.className = 'node';
    document.body.appendChild(node);

    // hover 이벤트 트리거
    node.dispatchEvent(new Event('mouseenter'));

    const styles = window.getComputedStyle(node);
    expect(styles.transform).toBe('scale(1.05)');
  });

  test('반응형 디자인이 작동해야 합니다', () => {
    // 뷰포트 크기 설정
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'mindmap-wrapper';
    document.body.appendChild(wrapper);

    const styles = window.getComputedStyle(wrapper);

    // 미디어 쿼리가 작동했을 때의 스타일
    expect(styles.transform).toBe('scale(0.8)');
    expect(styles.transformOrigin).toBe('center top');
  });

  test('접근성 클래스가 올바르게 작동해야 합니다', () => {
    const focusedNode = document.createElement('div');
    focusedNode.className = 'keyboard-focused node';
    focusedNode.setAttribute('tabindex', '0');
    document.body.appendChild(focusedNode);

    // 포커스 이벤트 트리거
    focusedNode.focus();

    const styles = window.getComputedStyle(focusedNode);
    expect(styles.outline).toBe('2px solid rgb(74, 144, 226)');
    expect(styles.outlineOffset).toBe('2px');
  });

  test('고대비 모드 스타일이 적용되어야 합니다', () => {
    // prefers-contrast 모드 시뮬레이션
    document.documentElement.setAttribute('data-contrast', 'high');

    const container = document.createElement('div');
    container.className = 'mindmap-container';
    document.body.appendChild(container);

    const styles = window.getComputedStyle(container);
    // 고대비 모드에서는 배경이 흰색으로 변경됨
    expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
  });
});