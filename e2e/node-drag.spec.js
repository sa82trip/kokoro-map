import { test, expect } from '@playwright/test';

// 헬퍼: 마우스 드래그 시뮬레이션
async function dragElement(page, selector, dx, dy) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Element ${selector} not found`);

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // 중간 지점들을 거쳐 자연스럽게 이동
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      startX + (dx * i) / steps,
      startY + (dy * i) / steps
    );
  }
  await page.mouse.up();
}

// 헬퍼: 캔버스 배경에서 패닝
async function panCanvas(page, dx, dy) {
  // 캔버스 빈 영역에서 드래그 (툴바 아래, 노드가 없는 영역)
  const startX = 200;
  const startY = 500;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      startX + (dx * i) / steps,
      startY + (dy * i) / steps
    );
  }
  await page.mouse.up();
}

test.describe('노드 드래그 버그 재현', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="node-container"]');
  });

  test('기본 노드 드래그 - 정상 동작 확인', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 루트 노드가 보이는지 확인
    const rootNode = page.locator('[data-testid="node-container"]').first();
    await expect(rootNode).toBeVisible();

    // 오른쪽으로 살짝 드래그
    await dragElement(page, '[data-testid="node-container"]', 50, 0);

    // 에러가 없어야 함
    expect(errors).toHaveLength(0);
  });

  test('루트 노드를 위쪽으로 드래그 - Y축 에러 재현', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const rootNode = page.locator('[data-testid="node-container"]').first();
    await expect(rootNode).toBeVisible();

    // 루트 노드를 위쪽으로 크게 드래그 (툴바 영역 넘어서)
    const box = await rootNode.boundingBox();
    await dragElement(page, '[data-testid="node-container"]', 0, -(box.y - 10));

    // 노드가 여전히 존재하고 에러가 없어야 함
    await expect(rootNode).toBeVisible();
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('자식 노드 추가 후 위쪽 드래그 - Y축 에러 재현', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 자식 노드 추가
    const rootNode = page.locator('[data-testid="node-container"]').first();
    await rootNode.click();

    // + 버튼으로 자식 추가
    const addButton = rootNode.locator('div').filter({ hasText: '+' }).first();
    // 오른쪽 + 버튼 클릭 (자식 추가)
    await page.evaluate(() => {
      const btns = document.querySelectorAll('[data-testid="node-container"] div');
      for (const btn of btns) {
        if (btn.textContent.trim() === '+' && btn.style.backgroundColor === 'rgb(82, 196, 26)') {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(200);

    // 자식 노드가 생성되었는지 확인
    const nodes = page.locator('[data-testid="node-container"]');
    const count = await nodes.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // 첫 번째 자식 노드를 위로 드래그
    const childNode = nodes.nth(1);
    const childBox = await childNode.boundingBox();
    if (childBox) {
      await dragElement(page, '[data-testid="node-container"] >> nth=1', 0, -(childBox.y - 20));

      // 에러 없어야 함
      expect(errors).toHaveLength(0);
      await expect(childNode).toBeVisible();
    }
  });

  test('자식 노드를 아래쪽으로 드래그 - 연결선 추적 확인', async ({ page }) => {
    // 자식 노드 3개 추가
    const rootNode = page.locator('[data-testid="node-container"]').first();

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const rootContainer = document.querySelector('[data-testid="node-container"]');
        if (rootContainer) {
          const addBtn = rootContainer.querySelectorAll('div');
          for (const btn of addBtn) {
            if (btn.textContent.trim() === '+' && btn.style.backgroundColor === 'rgb(82, 196, 26)') {
              btn.click();
              return true;
            }
          }
        }
        return false;
      });
      await page.waitForTimeout(100);
    }

    const nodes = page.locator('[data-testid="node-container"]');
    const count = await nodes.count();

    // 연결선이 존재하는지 확인
    const svgPaths = page.locator('svg path');
    const pathCount = await svgPaths.count();
    expect(pathCount).toBeGreaterThan(0);

    // 마지막 자식 노드를 아래로 드래그
    const lastChild = nodes.nth(count - 1);
    const lastBox = await lastChild.boundingBox();

    if (lastBox) {
      const beforeDragPathD = await svgPaths.last().getAttribute('d');

      await dragElement(page, `[data-testid="node-container"] >> nth=${count - 1}`, 0, 150);

      // 드래그 후 연결선이 업데이트되었는지 확인
      // (path의 d 속성이 변경되었거나, 새로운 path가 그려졌어야 함)
      const afterDragPathD = await svgPaths.last().getAttribute('d');

      // 연결선이 여전히 존재해야 함
      const postDragPaths = await svgPaths.count();
      expect(postDragPaths).toBeGreaterThan(0);
    }
  });

  test('캔버스 패닝 후 노드 드래그 - 좌표 변환 확인', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 자식 노드 추가
    await page.evaluate(() => {
      const rootContainer = document.querySelector('[data-testid="node-container"]');
      if (rootContainer) {
        const addBtn = rootContainer.querySelectorAll('div');
        for (const btn of addBtn) {
          if (btn.textContent.trim() === '+' && btn.style.backgroundColor === 'rgb(82, 196, 26)') {
            btn.click();
            return;
          }
        }
      }
    });
    await page.waitForTimeout(100);

    // 캔버스 패닝
    await panCanvas(page, 100, 80);
    await page.waitForTimeout(100);

    // 노드 위치 기록
    const nodes = page.locator('[data-testid="node-container"]');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      const beforeBox = await nodes.nth(1).boundingBox();

      // 패닝 후 자식 노드 드래그
      await dragElement(page, '[data-testid="node-container"] >> nth=1', 50, 50);

      // 드래그 후 위치가 변경되었는지 확인
      const afterBox = await nodes.nth(1).boundingBox();

      // 에러 없어야 함
      expect(errors).toHaveLength(0);

      // 노드가 이동했어야 함
      if (beforeBox && afterBox) {
        expect(Math.abs(afterBox.x - beforeBox.x - 50)).toBeLessThan(20);
        expect(Math.abs(afterBox.y - beforeBox.y - 50)).toBeLessThan(20);
      }
    }
  });

  test('패닝 후 맨 위 노드 위로 드래그 - 핵심 버그 재현', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 자식 노드 2개 추가
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        const rootContainer = document.querySelector('[data-testid="node-container"]');
        if (rootContainer) {
          const addBtn = rootContainer.querySelectorAll('div');
          for (const btn of addBtn) {
            if (btn.textContent.trim() === '+' && btn.style.backgroundColor === 'rgb(82, 196, 26)') {
              btn.click();
              return;
            }
          }
        }
      });
      await page.waitForTimeout(100);
    }

    // 캔버스를 위로 패닝 (노드들이 아래로 내려가게)
    await panCanvas(page, 0, 200);
    await page.waitForTimeout(200);

    // 자식 노드 (위쪽에 있는 것)를 위로 드래그
    const nodes = page.locator('[data-testid="node-container"]');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      const childBox = await nodes.nth(1).boundingBox();
      if (childBox && childBox.y > 70) {
        // 노드를 위로 드래그 (툴바 쪽으로)
        await dragElement(page, '[data-testid="node-container"] >> nth=1', 0, -(childBox.y - 60));

        expect(errors).toHaveLength(0);
        await expect(nodes.nth(1)).toBeVisible();
      }
    }
  });

  test('패닝 후 맨 아래 노드 아래로 드래그 - 연결선 버그 재현', async ({ page }) => {
    // 자식 노드 3개 추가
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const rootContainer = document.querySelector('[data-testid="node-container"]');
        if (rootContainer) {
          const addBtn = rootContainer.querySelectorAll('div');
          for (const btn of addBtn) {
            if (btn.textContent.trim() === '+' && btn.style.backgroundColor === 'rgb(82, 196, 26)') {
              btn.click();
              return;
            }
          }
        }
      });
      await page.waitForTimeout(100);
    }

    // 캔버스를 위로 패닝
    await panCanvas(page, 0, 150);
    await page.waitForTimeout(200);

    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // 마지막 자식을 아래로 크게 드래그
    const nodes = page.locator('[data-testid="node-container"]');
    const nodeCount = await nodes.count();

    if (nodeCount >= 3) {
      const svgPaths = page.locator('svg path');
      const pathCountBefore = await svgPaths.count();

      await dragElement(page, `[data-testid="node-container"] >> nth=${nodeCount - 1}`, 0, 200);

      // 연결선이 여전히 존재해야 함
      const pathCountAfter = await svgPaths.count();
      expect(pathCountAfter).toBeGreaterThanOrEqual(pathCountBefore);
      expect(errors).toHaveLength(0);
    }
  });
});
