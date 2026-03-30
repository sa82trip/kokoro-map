# US-14-1: html-to-image 라이브러리 설치 및 설정

## 작업 내용
html-to-image 라이브러리를 설치하고 PNG 내보내기 기능을 위한 초기 설정을 진행합니다.

## 상태
**[ ] 설계 완료** → **[x] 완료**

## 구현 사항
- html-to-image 라이브러리 설치
- FileExporter에 PNG 내보내기 기능 추가
- 내보내기 옵션 모델 정의

## 코드 예시
```javascript
// FileExporter.js
import { toPng } from 'html-to-image';

export const exportToPNG = async (element, config = {}) => {
  const {
    background = 'theme',
    padding = 20,
    scale = 2
  } = config;

  // 옵션 설정 로직
  const options = {
    backgroundColor: background === 'transparent' ? 'transparent' :
                     background === 'white' ? '#ffffff' : 'theme',
    pixelRatio: scale,
    quality: 0.95,
    style: {
      padding: `${padding}px`
    }
  };

  return await toPng(element, options);
};
```

## 테스트
- [x] html-to-image 라이브러리 import 확인
- [x] 기본 내보내기 기능 동작 테스트
- [ ] 다양한 옵션 조합 테스트 (나중에)