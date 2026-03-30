// 마인드맵 좌/우 분할 자동 레이아웃 엔진

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

const DEFAULT_OPTIONS = {
  horizontalGap: 100,
  verticalGap: 30,
};

/**
 * 루트의 직계 자식에 direction(left/right)을 교대로 할당
 * 이미 direction이 있는 노드는 유지, 하위 노드에 전파
 */
const assignDirections = (rootNode) => {
  if (!rootNode.children || rootNode.children.length === 0) return;

  rootNode.children.forEach((child, index) => {
    if (!child.direction) {
      child.direction = index % 2 === 0 ? 'right' : 'left';
    }
  });

  const propagateDirection = (node, dir) => {
    if (node.children) {
      node.children.forEach(child => {
        child.direction = dir;
        propagateDirection(child, dir);
      });
    }
  };

  rootNode.children.forEach(child => {
    propagateDirection(child, child.direction);
  });
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
 * 노드와 모든 자식의 위치를 계산
 * direction에 따라 왼쪽 또는 오른쪽으로 확장
 */
const layoutNode = (node, x, y, availableHeight, options, direction = 'right') => {
  const horizontalGap = (options && options.horizontalGap) || DEFAULT_OPTIONS.horizontalGap;
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;

  node.position = { x, y: y + availableHeight / 2 - NODE_HEIGHT / 2 };

  if (!node.children || node.children.length === 0) return;

  const totalChildrenHeight = node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child, options),
    0
  );
  const totalGaps = (node.children.length - 1) * verticalGap;
  const totalHeight = totalChildrenHeight + totalGaps;

  let currentY = y + availableHeight / 2 - totalHeight / 2;

  const dir = node.direction || direction;

  node.children.forEach((child) => {
    const childHeight = getSubtreeHeight(child, options);
    const childDir = child.direction || dir;
    const childX = childDir === 'left'
      ? x - NODE_WIDTH - horizontalGap
      : x + NODE_WIDTH + horizontalGap;
    layoutNode(child, childX, currentY, childHeight, options, childDir);
    currentY += childHeight + verticalGap;
  });
};

/**
 * 한 방향의 자식 그룹을 배치
 */
const layoutDirectionGroup = (children, parentPosition, startY, options, direction) => {
  const horizontalGap = (options && options.horizontalGap) || DEFAULT_OPTIONS.horizontalGap;
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;

  let currentY = startY;

  children.forEach(child => {
    const childHeight = getSubtreeHeight(child, options);
    const childX = direction === 'left'
      ? parentPosition.x - NODE_WIDTH - horizontalGap
      : parentPosition.x + NODE_WIDTH + horizontalGap;
    layoutNode(child, childX, currentY, childHeight, options, direction);
    currentY += childHeight + verticalGap;
  });
};

/**
 * 전체 마인드맵을 자동 레이아웃
 * 루트 노드를 화면 중앙에 배치하고 자식을 좌/우로 분할 배치
 */
export const calculateAutoLayout = (rootNode, options) => {
  if (!rootNode) return null;

  const mergedOptions = Object.assign({}, DEFAULT_OPTIONS, options);

  // 깊은 복사
  const layouted = JSON.parse(JSON.stringify(rootNode));

  // direction 할당
  assignDirections(layouted);

  // 루트 노드를 화면 중앙에 배치
  const centerX = Math.max(NODE_WIDTH, window.innerWidth / 2 - NODE_WIDTH / 2);

  // 좌/우 자식 분리
  const rightChildren = layouted.children.filter(c => (c.direction || 'right') === 'right');
  const leftChildren = layouted.children.filter(c => c.direction === 'left');

  // 각 방향별 높이 계산
  const rightHeight = rightChildren.reduce((sum, c) => sum + getSubtreeHeight(c, mergedOptions), 0)
    + Math.max(0, rightChildren.length - 1) * mergedOptions.verticalGap;
  const leftHeight = leftChildren.reduce((sum, c) => sum + getSubtreeHeight(c, mergedOptions), 0)
    + Math.max(0, leftChildren.length - 1) * mergedOptions.verticalGap;

  const totalHeight = Math.max(rightHeight, leftHeight, NODE_HEIGHT);
  const startY = Math.max(20, window.innerHeight / 2 - totalHeight / 2);

  // 루트 위치 설정
  layouted.position = { x: centerX, y: startY + totalHeight / 2 - NODE_HEIGHT / 2 };

  // 오른쪽 자식 배치
  if (rightChildren.length > 0) {
    const rightStartY = layouted.position.y + NODE_HEIGHT / 2 - rightHeight / 2;
    layoutDirectionGroup(rightChildren, layouted.position, rightStartY, mergedOptions, 'right');
  }

  // 왼쪽 자식 배치
  if (leftChildren.length > 0) {
    const leftStartY = layouted.position.y + NODE_HEIGHT / 2 - leftHeight / 2;
    layoutDirectionGroup(leftChildren, layouted.position, leftStartY, mergedOptions, 'left');
  }

  return layouted;
};

/**
 * 단일 노드 추가 시 기존 위치를 유지하면서 새 노드의 초기 위치만 계산
 * direction에 따라 부모의 왼쪽 또는 오른쪽에 배치
 */
export const calculateNewChildPosition = (parentPosition, existingChildrenCount, options, direction) => {
  const horizontalGap = (options && options.horizontalGap) || DEFAULT_OPTIONS.horizontalGap;
  const verticalGap = (options && options.verticalGap) || DEFAULT_OPTIONS.verticalGap;
  const dir = direction || 'right';
  return {
    x: dir === 'left'
      ? parentPosition.x - NODE_WIDTH - horizontalGap
      : parentPosition.x + NODE_WIDTH + horizontalGap,
    y: parentPosition.y + existingChildrenCount * (NODE_HEIGHT + verticalGap)
  };
};
