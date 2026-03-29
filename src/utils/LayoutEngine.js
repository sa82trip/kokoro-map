// 마인드맵 방사형 자동 레이아웃 엔진

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

const DEFAULT_OPTIONS = {
  horizontalGap: 100,
  verticalGap: 30,
};

/**
 * 트리의 각 노드가 필요로 하는 총 높이를 계산
 * (자식 노드들이 차지하는 공간 + 간격)
 */
const getSubtreeHeight = (node, options) => {
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;
  if (!node.children || node.children.length === 0) {
    return NODE_HEIGHT;
  }

  const childrenHeight = node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child, options),
    0
  );
  const gaps = (node.children.length - 1) * verticalGap;

  return Math.max(NODE_HEIGHT, childrenHeight + gaps);
};

/**
 * 노드와 모든 자식의 위치를 방사형(오른쪽으로 뻗는 트리)으로 계산
 */
const layoutNode = (node, x, y, availableHeight, options) => {
  const horizontalGap = (options && options.horizontalGap) || DEFAULT_OPTIONS.horizontalGap;
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;

  node.position = { x, y: y + availableHeight / 2 - NODE_HEIGHT / 2 };

  if (!node.children || node.children.length === 0) return;

  const childX = x + NODE_WIDTH + horizontalGap;
  const totalChildrenHeight = node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child, options),
    0
  );
  const totalGaps = (node.children.length - 1) * verticalGap;
  const totalHeight = totalChildrenHeight + totalGaps;

  let currentY = y + availableHeight / 2 - totalHeight / 2;

  node.children.forEach((child) => {
    const childHeight = getSubtreeHeight(child, options);
    layoutNode(child, childX, currentY, childHeight, options);
    currentY += childHeight + verticalGap;
  });
};

/**
 * 전체 마인드맵을 자동 레이아웃
 * 루트 노드를 화면 중앙에 배치하고 자식을 오른쪽으로 트리 형태로 배치
 */
export const calculateAutoLayout = (rootNode, options) => {
  if (!rootNode) return null;

  const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, options);

  // 깊은 복사
  const layouted = JSON.parse(JSON.stringify(rootNode));

  const centerX = Math.max(100, window.innerWidth / 2 - 300);
  const centerY = 0;

  const totalHeight = getSubtreeHeight(layouted, mergedOptions);
  const startY = Math.max(20, window.innerHeight / 2 - totalHeight / 2);

  layoutNode(layouted, centerX, startY, totalHeight, mergedOptions);

  return layouted;
};

/**
 * 단일 노드 추가 시 기존 위치를 유지하면서 새 노드의 초기 위치만 계산
 * 부모 노드의 오른쪽, 기존 자식들 아래에 배치
 */
export const calculateNewChildPosition = (parentPosition, existingChildrenCount, options) => {
  const horizontalGap = (options && options.horizontalGap) || DEFAULT_OPTIONS.horizontalGap;
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;
  return {
    x: parentPosition.x + NODE_WIDTH + horizontalGap,
    y: parentPosition.y + existingChildrenCount * (NODE_HEIGHT + verticalGap)
  };
};
