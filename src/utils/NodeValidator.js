// 데이터 유효성 검증 유틸리티

// 유효한 색상 패턴
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

// 유효성 검증 규칙
export const validationRules = {
  nodeId: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'ID는 영문, 숫자, _, - 만 허용됩니다'
  },
  text: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: '텍스트는 1~200자 사이여야 합니다'
  },
  color: {
    required: false,
    pattern: COLOR_PATTERN,
    defaultValue: '#4A90E2',
    message: '색상은 #RRGGBB 형식이어야 합니다'
  },
  position: {
    required: true,
    x: {
      type: 'number',
      min: 0,
      max: 4096,
      message: 'X 좌표는 0~4096 사이여야 합니다'
    },
    y: {
      type: 'number',
      min: 0,
      max: 4096,
      message: 'Y 좌표는 0~4096 사이여야 합니다'
    }
  },
  children: {
    required: false,
    type: 'array',
    maxItems: 50,
    message: '자식 노드는 최대 50개까지 허용됩니다'
  }
};

// 유효성 검증 함수
export const validateNode = (node) => {
  const errors = [];

  // 필수 필드 검사
  if (!node.id || typeof node.id !== 'string') {
    errors.push('ID가 필요합니다');
  }

  if (!node.text || node.text.trim().length === 0) {
    errors.push('텍스트가 필요합니다');
  }

  if (node.text && node.text.length > 200) {
    errors.push('텍스트가 너무 깁니다 (최대 200자)');
  }

  // 위치 검사
  if (!node.position || typeof node.position !== 'object') {
    errors.push('위치 정보가 필요합니다');
  } else {
    if (node.position.x < 0 || node.position.x > 4096) {
      errors.push('X 좌표가 유효하지 않습니다');
    }
    if (node.position.y < 0 || node.position.y > 4096) {
      errors.push('Y 좌표가 유효하지 않습니다');
    }
  }

  // 색상 검사
  if (node.color && !COLOR_PATTERN.test(node.color)) {
    errors.push('색상 형식이 올바르지 않습니다 (#RRGGBB)');
  }

  // 자식 노드 검사
  if (node.children && !Array.isArray(node.children)) {
    errors.push('자식 노드는 배열이어야 합니다');
  } else if (node.children && node.children.length > 50) {
    errors.push('자식 노드가 너무 많습니다');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 재귀적 유효성 검증
export const validateMindMap = (rootNode) => {
  const results = [];

  const validateRecursive = (node, depth = 0) => {
    const result = validateNode(node);
    results.push({
      nodeId: node.id,
      depth,
      ...result
    });

    if (result.isValid && node.children) {
      node.children.forEach(child => validateRecursive(child, depth + 1));
    }
  };

  validateRecursive(rootNode);

  const allValid = results.every(r => r.isValid);

  return {
    isValid: allValid,
    results,
    errors: allValid ? [] : results.filter(r => !r.isValid)
  };
};