// 노드 데이터 구조 인터페이스
export const ITreeNode = {
  id: 'string',
  text: 'string',
  color: 'string',
  position: {
    x: 'number',
    y: 'number'
  },
  children: 'array',
  isRoot: 'boolean'
};

// 실제 타입 정의
export const NodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    text: { type: 'string', minLength: 1 },
    color: {
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    position: {
      type: 'object',
      properties: {
        x: { type: 'number', minimum: 0 },
        y: { type: 'number', minimum: 0 }
      },
      required: ['x', 'y']
    },
    children: {
      type: 'array',
      items: { $ref: '#/definitions/Node' }
    },
    isRoot: { type: 'boolean' }
  },
  required: ['id', 'text', 'position', 'isRoot'],
  definitions: {
    Node: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        text: { type: 'string' },
        color: { type: 'string' },
        position: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' }
          }
        },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/Node' }
        },
        isRoot: { type: 'boolean' }
      }
    }
  }
};

// 유틸리티 함수
export const validateNode = (node) => {
  const required = ['id', 'text', 'position', 'isRoot'];
  return required.every(field => node.hasOwnProperty(field));
};

// 자식 노드용 색상 팔레트
const CHILD_COLORS = [
  '#E67E22', // 주황
  '#9B59B6', // 보라
  '#1ABC9C', // 청록
  '#E74C3C', // 빨강
  '#F39C12', // 금색
  '#2ECC71', // 초록
  '#3498DB', // 파랑
  '#E91E63', // 분홍
];

let colorIndex = 0;
let nodeIdCounter = 0;

// 부모 색상 기반으로 자식 색상 생성
export const getChildNodeColor = (parentColor) => {
  // 부모 색상 해시로 시작 인덱스 결정
  const hash = parentColor.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = (hash + colorIndex) % CHILD_COLORS.length;
  colorIndex++;
  return CHILD_COLORS[index];
};

export const createRootNode = (text = '마인드맵') => ({
  id: 'root',
  text,
  color: '#4A90E2',
  position: {
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 - 40
  },
  children: [],
  isRoot: true
});

export const createChildNode = (parentId, text = '새 노드', parentColor = '#4A90E2') => ({
  id: `node-${Date.now()}-${++nodeIdCounter}`,
  text,
  color: getChildNodeColor(parentColor),
  position: { x: 0, y: 0 },
  children: [],
  isRoot: false,
  parentId
});