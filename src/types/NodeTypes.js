// 노드 데이터 구조 인터페이스
// 노드 텍스트 스타일 기본값
export const DEFAULT_NODE_STYLE = {
  fontSize: 16,
  textColor: '#FFFFFF',
  fontWeight: '500',
  fontStyle: 'normal'
};

export const ITreeNode = {
  id: 'string',
  text: 'string',
  color: 'string',
  position: {
    x: 'number',
    y: 'number'
  },
  children: 'array',
  isRoot: 'boolean',
  style: {
    fontSize: 'number',
    textColor: 'string',
    fontWeight: 'string',
    fontStyle: 'string'
  }
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
    isRoot: { type: 'boolean' },
    style: {
      type: 'object',
      properties: {
        fontSize: { type: 'number', minimum: 8, maximum: 72 },
        textColor: { type: 'string' },
        fontWeight: { type: 'string' },
        fontStyle: { type: 'string' }
      }
    }
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
        isRoot: { type: 'boolean' },
        style: {
          type: 'object',
          properties: {
            fontSize: { type: 'number' },
            textColor: { type: 'string' },
            fontWeight: { type: 'string' },
            fontStyle: { type: 'string' }
          }
        }
      }
    }
  }
};

// 유틸리티 함수
export const validateNode = (node) => {
  const required = ['id', 'text', 'position', 'isRoot'];
  return required.every(field => node.hasOwnProperty(field));
};

// 50가지 색상 팔레트
export const COLOR_PALETTE = [
  // 기존 8색
  '#E67E22', '#9B59B6', '#1ABC9C', '#E74C3C',
  '#F39C12', '#2ECC71', '#3498DB', '#E91E63',
  // 파스텔 계열 (12색)
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
  '#BAE1FF', '#E8BAFF', '#FFC9DE', '#C9FFE5',
  '#C9E5FF', '#E5C9FF', '#FFE5C9', '#C9FFEE',
  // 비비드 계열 (12색)
  '#FF6B6B', '#FFA07A', '#FFD700', '#98FB98',
  '#87CEEB', '#DDA0DD', '#FF69B4', '#00CED1',
  '#7B68EE', '#FF8C00', '#00FA9A', '#DC143C',
  // 다크/딥 계열 (10색)
  '#8B0000', '#006400', '#00008B', '#4B0082',
  '#2F4F4F', '#800080', '#191970', '#556B2F',
  '#8B4513', '#2E8B57',
  // 뉴트럴/그레이 계열 (8색)
  '#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9',
  '#808080', '#696969', '#333333', '#000000',
];

// 자식 노드용 색상 팔레트 (COLOR_PALETTE의 처음 8색)
const CHILD_COLORS = COLOR_PALETTE.slice(0, 8);

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
  isRoot: true,
  style: { ...DEFAULT_NODE_STYLE }
});

export const createChildNode = (parentId, text = '새 노드', parentColor = '#4A90E2') => ({
  id: `node-${Date.now()}-${++nodeIdCounter}`,
  text,
  color: getChildNodeColor(parentColor),
  position: { x: 0, y: 0 },
  children: [],
  isRoot: false,
  parentId,
  style: { ...DEFAULT_NODE_STYLE }
});