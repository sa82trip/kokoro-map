# US-14-2: ExportDialog 컴포넌트 구현

## 작업 내용
PNG 내보내기 옵션 선택을 위한 ExportDialog 컴포넌트를 구현합니다.

## 상태
**[ ] 설계 완료** → **[x] 완료**

## 구현 사항
- 배경색 옵션 선택 (투명/흰색/현재 테마)
- 여백 슬라이더 컨트롤 (0~100px)
- 해상도 배율 선택 (1x/2x/3x)
- 내보내기 버튼 및 취소 버튼
- 로딩 상태 표시

## 컴포넌트 구조
```javascript
// ExportDialog.jsx
function ExportDialog({ isOpen, onClose, onExport }) {
  const [config, setConfig] = useState({
    background: 'theme',
    padding: 20,
    scale: 2
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(config);
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <DialogTitle>PNG 내보내기 설정</DialogTitle>

      <BackgroundSelector
        value={config.background}
        onChange={(value) => setConfig({...config, background: value})}
      />

      <PaddingSelector
        value={config.padding}
        onChange={(value) => setConfig({...config, padding: value})}
      />

      <ScaleSelector
        value={config.scale}
        onChange={(value) => setConfig({...config, scale: value})}
      />

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>취소</Button>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? '내보내는 중...' : '내보내기'}
        </Button>
      </DialogFooter>
    </Modal>
  );
}
```

## 테스트
- [x] 컴포넌트 렌더링 확인
- [x] 옵션 변경 상태 업데이트 테스트
- [ ] 내보내기 버튼 클릭 시 이벤트 발생 테스트
- [ ] 모달 외부 클릭 시 닫히는 기능 테스트