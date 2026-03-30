import {
  generateExportFilename,
  createExportEnvelope,
  exportToJSON
} from './FileExporter';
import { EXPORT_VERSION } from '../types/DocumentTypes';

describe('FileExporter', () => {
  describe('generateExportFilename', () => {
    test('기본 파일명을 생성한다', () => {
      const filename = generateExportFilename('내 마인드맵');
      expect(filename).toMatch(/내-마인드맵-\d{4}-\d{2}-\d{2}\.mindmap\.json/);
    });

    test('특수문자를 제거한다', () => {
      const filename = generateExportFilename('Test/File<>Map');
      expect(filename).not.toContain('/');
      expect(filename).not.toContain('<');
      expect(filename).not.toContain('>');
    });

    test('빈 문자열이면 기본명을 사용한다', () => {
      const filename = generateExportFilename('');
      expect(filename).toMatch(/^mindmap-/);
    });

    test('긴 제목은 50자로 자른다', () => {
      const longTitle = 'a'.repeat(100);
      const filename = generateExportFilename(longTitle);
      const namePart = filename.split('-20')[0];
      expect(namePart.length).toBeLessThanOrEqual(55);
    });
  });

  describe('createExportEnvelope', () => {
    test('올바른 envelope 구조를 생성한다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      const meta = { title: '내 문서', nodeCount: 3 };

      const envelope = createExportEnvelope(data, meta);

      expect(envelope.version).toBe(EXPORT_VERSION);
      expect(envelope.exportedAt).toBeDefined();
      expect(envelope.meta.title).toBe('내 문서');
      expect(envelope.meta.nodeCount).toBe(3);
      expect(envelope.data).toEqual(data);
    });

    test('meta가 없으면 기본값을 사용한다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      const envelope = createExportEnvelope(data, null);

      expect(envelope.meta.title).toBe('마인드맵');
      expect(envelope.meta.nodeCount).toBe(0);
    });
  });

  describe('exportToJSON', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;

    beforeEach(() => {
      mockCreateObjectURL = jest.fn(() => 'blob:test');
      mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('envelope와 filename을 반환한다', () => {
      const data = { id: 'root', text: '테스트', children: [], isRoot: true };
      const meta = { title: '테스트 문서', nodeCount: 1 };

      const result = exportToJSON(data, meta);

      expect(result.envelope).toBeDefined();
      expect(result.envelope.version).toBe(EXPORT_VERSION);
      expect(result.filename).toContain('테스트-문서');
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });
});
