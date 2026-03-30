import React from 'react';

const SHORTCUT_GROUPS = [
  {
    title: '노드 조작',
    items: [
      { keys: ['Enter'], desc: '자식 노드 추가' },
      { keys: ['Tab'], desc: '형제 노드 추가' },
      { keys: ['Delete', 'Backspace'], desc: '선택된 노드 삭제' },
      { keys: ['Esc'], desc: '선택 해제' },
    ]
  },
  {
    title: '노드 탐색',
    items: [
      { keys: ['→'], desc: '첫 번째 자식으로 이동' },
      { keys: ['←'], desc: '부모 노드로 이동' },
      { keys: ['↑'], desc: '이전 형제로 이동' },
      { keys: ['↓'], desc: '다음 형제로 이동' },
    ]
  },
  {
    title: '일반',
    items: [
      { keys: ['Ctrl', 'S'], desc: '저장' },
      { keys: ['Ctrl', 'Z'], desc: '실행 취소' },
      { keys: ['Ctrl', 'Shift', 'Z'], desc: '다시 실행' },
      { keys: ['?'], desc: '단축키 도움말' },
    ]
  }
];

const KeyboardShortcutsHelp = ({ onClose }) => {
  return (
    <div
      data-testid="shortcuts-help"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: '28px 32px',
          maxWidth: 520,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
            키보드 단축키
          </h2>
          <button
            data-testid="shortcuts-help-close"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f0f0f0',
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 16,
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#4A90E2',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {group.title}
            </div>
            {group.items.map((item) => (
              <div
                key={item.desc}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px solid #f0f2f5'
                }}
              >
                <span style={{ fontSize: 14, color: '#444' }}>{item.desc}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {item.keys.map((key, i) => (
                    <React.Fragment key={key}>
                      {i > 0 && <span style={{ fontSize: 12, color: '#999', lineHeight: '24px' }}>+</span>}
                      <kbd style={{
                        background: '#f5f7fa',
                        border: '1px solid #d9dde4',
                        borderRadius: 5,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        color: '#333',
                        minWidth: 24,
                        textAlign: 'center',
                        display: 'inline-block',
                        lineHeight: '20px'
                      }}>
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 12,
          color: '#999'
        }}>
          <kbd style={{
            background: '#f5f7fa',
            border: '1px solid #d9dde4',
            borderRadius: 5,
            padding: '2px 8px',
            fontSize: 12
          }}>?</kbd> 또는 <kbd style={{
            background: '#f5f7fa',
            border: '1px solid #d9dde4',
            borderRadius: 5,
            padding: '2px 8px',
            fontSize: 12
          }}>Esc</kbd> 를 눌러 닫기
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
