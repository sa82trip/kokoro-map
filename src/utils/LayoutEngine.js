// 마인드맵 방사형 자동 레이아웃 엔진

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 100; // 노드 간 수평 간격
const VERTICAL_GAP = 30; // 같은 레벨 노드 간 수직 간격

/**
 * 트리의 각 노드가 필요로 하는 총 높이를 계산
 * (자식 노드들이 차지하는 공간 + 간격)
 */
const getSubtreeHeight = (node) => {
  if (!node.children || node.children.length === 0) {
    return NODE_HEIGHT;
  }

  const childrenHeight = node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child),
    0
  );
  const gaps = (node.children.length - 1) * VERTICAL_GAP;

  return Math.max(NODE_HEIGHT, childrenHeight + gaps);
};

/**
 * 노드와 모든 자식의 위치를 방사형(오른쪽으로 뻗는 트리)으로 계산
 */
const layoutNode = (node, x, y, availableHeight) => {
  node.position = { x, y: y + availableHeight / 2 - NODE_HEIGHT / 2 };

  if (!node.children || node.children.length === 0) return;

  const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
  const totalChildrenHeight = node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child),
    0
  );
  const totalGaps = (node.children.length - 1) * VERTICAL_GAP;
  const totalHeight = totalChildrenHeight + totalGaps;

  let currentY = y + availableHeight / 2 - totalHeight / 2;

  node.children.forEach((child) => {
    const childHeight = getSubtreeHeight(child);
    layoutNode(child, childX, currentY, childHeight);
    currentY += childHeight + VERTICAL_GAP;
  });
};

/**
 * 전체 마인드맵을 자동 레이아웃
 * 루트 노드를 화면 중앙에 배치하고 자식을 오른쪽으로 트리 형태로 배치
 */
export const calculateAutoLayout = (rootNode) => {
  if (!rootNode) return null;

  // 깊은 복사
  const layouted = JSON.parse(JSON.stringify(rootNode));

  const centerX = Math.max(100, window.innerWidth / 2 - 300);
  const centerY = 0;

  const totalHeight = getSubtreeHeight(layouted);
  const startY = Math.max(20, window.innerHeight / 2 - totalHeight / 2);

  layoutNode(layouted, centerX, startY, totalHeight);

  return layouted;
};

/**
 * 단일 노드 추가 시 기존 위치를 유지하면서 새 노드의 초기 위치만 계산
 * 부모 노드의 오른쪽, 기존 자식들 아래에 배치
 */
export const calculateNewChildPosition = (parentPosition, existingChildrenCount) => {
  return {
    x: parentPosition.x + NODE_WIDTH + HORIZONTAL_GAP,
    y: parentPosition.y + existingChildrenCount * (NODE_HEIGHT + VERTICAL_GAP)
  };
};
