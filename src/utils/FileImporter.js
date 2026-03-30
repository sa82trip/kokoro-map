import { EXPORT_VERSION } from '../types/DocumentTypes';
import { validateMindMap } from './NodeValidator';

// JSON 파일 읽기
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file);
  });
};

// import envelope 검증
const validateImportEnvelope = (parsed) => {
  const errors = [];

  if (!parsed || typeof parsed !== 'object') {
    return { isValid: false, errors: ['유효하지 않은 파일 형식입니다'] };
  }

  if (parsed.version === undefined || parsed.version === null) {
    errors.push('버전 정보가 없습니다');
  } else if (parsed.version !== EXPORT_VERSION) {
    errors.push(`지원하지 않는 버전입니다 (현재: v${EXPORT_VERSION}, 파일: v${parsed.version})`);
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push('마인드맵 데이터가 없습니다');
  }

  return { isValid: errors.length === 0, errors };
};

// JSON 파일 가져오기 메인 함수
export const importFromJSON = async (file) => {
  try {
    // 1. 파일 읽기
    const text = await readFileAsText(file);

    // 2. JSON 파싱
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { success: false, errors: ['JSON 파싱에 실패했습니다: 유효하지 않은 JSON 형식'] };
    }

    // 3. envelope 검증
    const envelopeValidation = validateImportEnvelope(parsed);
    if (!envelopeValidation.isValid) {
      return { success: false, errors: envelopeValidation.errors };
    }

    // 4. 마인드맵 데이터 검증
    const mindMapValidation = validateMindMap(parsed.data);
    if (!mindMapValidation.isValid) {
      const errorMessages = mindMapValidation.errors.map(e =>
        typeof e === 'string' ? e : (e.errors ? e.errors.join(', ') : String(e))
      );
      return { success: false, errors: ['마인드맵 데이터 검증 실패', ...errorMessages] };
    }

    // 5. 성공
    return {
      success: true,
      data: parsed.data,
      meta: parsed.meta || { title: parsed.data.text || '가져온 마인드맵' }
    };
  } catch (e) {
    return { success: false, errors: [`가져오기 실패: ${e.message}`] };
  }
};

// 파일 선택 다이얼로그 열기
export const openFilePicker = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.mindmap.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = async (e) => {
      const file = e.target.files[0];
      document.body.removeChild(input);

      if (!file) {
        resolve({ success: false, errors: ['파일이 선택되지 않았습니다'] });
        return;
      }

      const result = await importFromJSON(file);
      resolve(result);
    };

    // 취소 시 처리
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve({ success: false, errors: ['파일 선택이 취소되었습니다'] });
    };

    input.click();
  });
};
