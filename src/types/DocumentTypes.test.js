import {
  EXPORT_VERSION,
  createDocumentMeta,
  updateDocumentMeta,
  validateDocumentMeta
} from './DocumentTypes';

describe('DocumentTypes', () => {
  describe('EXPORT_VERSION', () => {
    test('EXPORT_VERSION은 1이다', () => {
      expect(EXPORT_VERSION).toBe(1);
    });
  });

  describe('createDocumentMeta', () => {
    test('기본값으로 메타데이터를 생성한다', () => {
      const meta = createDocumentMeta();
      expect(meta.id).toBeDefined();
      expect(typeof meta.id).toBe('string');
      expect(meta.title).toBe('마인드맵');
      expect(meta.folderId).toBeNull();
      expect(meta.createdAt).toBeDefined();
      expect(meta.updatedAt).toBeDefined();
      expect(meta.nodeCount).toBe(0);
      expect(meta.thumbnail).toBeNull();
    });

    test('제목과 데이터로 메타데이터를 생성한다', () => {
      const data = {
        id: 'root', text: '루트', position: { x: 100, y: 100 },
        children: [
          { id: 'c1', text: '자식1', position: { x: 200, y: 100 }, children: [] },
          { id: 'c2', text: '자식2', position: { x: 200, y: 200 }, children: [] }
        ],
        isRoot: true
      };
      const meta = createDocumentMeta('내 마인드맵', data);
      expect(meta.title).toBe('내 마인드맵');
      expect(meta.nodeCount).toBe(3);
    });

    test('생성 시 createdAt과 updatedAt이 같다', () => {
      const meta = createDocumentMeta();
      expect(meta.createdAt).toBe(meta.updatedAt);
    });

    test('ID가 매번 다르게 생성된다', () => {
      const meta1 = createDocumentMeta();
      const meta2 = createDocumentMeta();
      expect(meta1.id).not.toBe(meta2.id);
    });

    test('데이터가 없으면 nodeCount는 0이다', () => {
      const meta = createDocumentMeta('빈 문서', null);
      expect(meta.nodeCount).toBe(0);
    });
  });

  describe('updateDocumentMeta', () => {
    test('updatedAt이 갱신되고 nodeCount가 업데이트된다', () => {
      const meta = createDocumentMeta('테스트');
      const originalUpdatedAt = meta.updatedAt;

      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-04-01T00:00:00.000Z');

      const updated = updateDocumentMeta(meta, {
        id: 'root', text: '루트', position: { x: 0, y: 0 },
        children: [{ id: 'c1', text: '자식', position: { x: 0, y: 0 }, children: [] }],
        isRoot: true
      });

      expect(updated.nodeCount).toBe(2);
      expect(updated.updatedAt).toBe('2026-04-01T00:00:00.000Z');
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);

      jest.restoreAllMocks();
    });

    test('데이터 없이 호출하면 nodeCount는 기존값을 유지한다', () => {
      const meta = createDocumentMeta('테스트', {
        id: 'root', text: '루트', position: { x: 0, y: 0 },
        children: [], isRoot: true
      });
      expect(meta.nodeCount).toBe(1);

      const updated = updateDocumentMeta(meta, null);
      expect(updated.nodeCount).toBe(1);
    });

    test('원본 메타데이터를 변경하지 않는다', () => {
      const meta = createDocumentMeta('테스트');
      const originalUpdatedAt = meta.updatedAt;
      updateDocumentMeta(meta, null);
      expect(meta.updatedAt).toBe(originalUpdatedAt);
    });

    test('data가 있으면 루트 노드 텍스트로 title을 갱신한다', () => {
      const meta = createDocumentMeta('마인드맵');
      const data = {
        id: 'root', text: '프로젝트 계획', position: { x: 0, y: 0 },
        children: [], isRoot: true
      };
      const updated = updateDocumentMeta(meta, data);
      expect(updated.title).toBe('프로젝트 계획');
    });

    test('data가 null이면 title을 유지한다', () => {
      const meta = createDocumentMeta('기존 제목');
      const updated = updateDocumentMeta(meta, null);
      expect(updated.title).toBe('기존 제목');
    });

    test('data의 text가 빈 문자열이면 기존 title을 유지한다', () => {
      const meta = createDocumentMeta('기존 제목');
      const data = {
        id: 'root', text: '', position: { x: 0, y: 0 },
        children: [], isRoot: true
      };
      const updated = updateDocumentMeta(meta, data);
      expect(updated.title).toBe('기존 제목');
    });
  });

  describe('validateDocumentMeta', () => {
    test('유효한 메타데이터는 검증을 통과한다', () => {
      const meta = createDocumentMeta('유효한 문서');
      const result = validateDocumentMeta(meta);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('null 입력 시 검증 실패한다', () => {
      const result = validateDocumentMeta(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('메타데이터가 없습니다');
    });

    test('id가 없으면 검증 실패한다', () => {
      const meta = createDocumentMeta('테스트');
      delete meta.id;
      const result = validateDocumentMeta(meta);
      expect(result.isValid).toBe(false);
    });

    test('title이 없으면 검증 실패한다', () => {
      const meta = createDocumentMeta('테스트');
      meta.title = '';
      const result = validateDocumentMeta(meta);
      expect(result.isValid).toBe(false);
    });

    test('createdAt이 없으면 검증 실패한다', () => {
      const meta = createDocumentMeta('테스트');
      delete meta.createdAt;
      const result = validateDocumentMeta(meta);
      expect(result.isValid).toBe(false);
    });

    test('nodeCount가 음수면 검증 실패한다', () => {
      const meta = createDocumentMeta('테스트');
      meta.nodeCount = -1;
      const result = validateDocumentMeta(meta);
      expect(result.isValid).toBe(false);
    });
  });
});
