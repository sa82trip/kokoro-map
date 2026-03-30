import { importFromJSON, openFilePicker } from './FileImporter';
import { EXPORT_VERSION } from '../types/DocumentTypes';

// NodeValidator mock
jest.mock('./NodeValidator', () => ({
  validateMindMap: jest.fn()
}));

const { validateMindMap } = require('./NodeValidator');

// 유효한 마인드맵 데이터
const validMindMapData = {
  id: 'root',
  text: '테스트 마인드맵',
  color: '#4A90E2',
  position: { x: 100, y: 100 },
  children: [],
  isRoot: true,
  style: { fontSize: 16, textColor: '#FFFFFF', fontWeight: '500', fontStyle: 'normal' }
};

// 유효한 envelope 생성 헬퍼
const createValidEnvelope = (data = validMindMapData) => ({
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  meta: { title: '테스트', nodeCount: 1 },
  data
});

// mock File 생성
const createMockFile = (content) => {
  const file = new File(
    [JSON.stringify(content)],
    'test.mindmap.json',
    { type: 'application/json' }
  );
  return file;
};

describe('FileImporter', () => {
  beforeEach(() => {
    validateMindMap.mockReturnValue({ isValid: true, errors: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('importFromJSON', () => {
    test('유효한 JSON 파일을 가져올 수 있다', async () => {
      const envelope = createValidEnvelope();
      const file = createMockFile(envelope);

      const result = await importFromJSON(file);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validMindMapData);
      expect(result.meta.title).toBe('테스트');
    });

    test('잘못된 JSON은 실패한다', async () => {
      const file = new File(['not valid json{{{'], 'bad.json', { type: 'application/json' });

      const result = await importFromJSON(file);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('JSON 파싱에 실패');
    });

    test('버전이 다르면 실패한다', async () => {
      const envelope = { ...createValidEnvelope(), version: 999 };
      const file = createMockFile(envelope);

      const result = await importFromJSON(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('지원하지 않는 버전'));
    });

    test('data 필드가 없으면 실패한다', async () => {
      const envelope = { version: EXPORT_VERSION, exportedAt: new Date().toISOString() };
      const file = createMockFile(envelope);

      const result = await importFromJSON(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('마인드맵 데이터가 없습니다');
    });

    test('마인드맵 검증 실패 시 실패한다', async () => {
      validateMindMap.mockReturnValue({
        isValid: false,
        errors: [{ errors: ['유효하지 않은 노드'] }]
      });

      const envelope = createValidEnvelope();
      const file = createMockFile(envelope);

      const result = await importFromJSON(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('마인드맵 데이터 검증 실패');
    });

    test('meta가 없어도 data.text에서 제목을 가져온다', async () => {
      const envelope = { version: EXPORT_VERSION, data: validMindMapData, exportedAt: new Date().toISOString() };
      const file = createMockFile(envelope);

      const result = await importFromJSON(file);

      expect(result.success).toBe(true);
      expect(result.meta.title).toBe('테스트 마인드맵');
    });
  });

  describe('openFilePicker', () => {
    test('input 요소를 생성하고 클릭한다', async () => {
      const mockClick = jest.fn();
      const mockInput = {
        type: '', accept: '', style: { display: '' },
        click: mockClick,
        onchange: null,
        oncancel: null
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockInput);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      // Promise가 resolve되지 않으므로 타임아웃으로 처리
      const pickerPromise = openFilePicker();

      expect(mockInput.type).toBe('file');
      expect(mockInput.accept).toBe('.json,.mindmap.json');
      expect(mockClick).toHaveBeenCalled();

      // 정리: oncancel 호출로 resolve
      mockInput.oncancel();

      const result = await pickerPromise;
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });
  });
});
