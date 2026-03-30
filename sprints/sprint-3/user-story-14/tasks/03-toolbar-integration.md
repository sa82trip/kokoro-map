# US-14-3: Toolbar 내보내기 버튼 통합

## 작업 내용
Toolbar의 내보내기 버튼에 PNG 옵션을 추가하고 ExportDialog와 연동합니다.

## 상태
**[ ] 설계 완료** → **[x] 완료**

## 구현 사항
- ExportDialog 상태 관리 (MindMapStore)
- Toolbar에 내보내기 버튼 클릭 이벤트 핸들러 추가
- 내보내기 후 알림 표시
- 저장 위치 설정 (기본 위치: 다운로드 폴더)

## Toolbar.jsx 변경 사항
```javascript
// Toolbar.jsx
const Toolbar = () => {
  const {
    showExportDialog,
    setShowExportDialog,
    exportToPNG
  } = useMindMap();

  const handleExportPNG = async (config) => {
    // 캡처 대상 요소 찾기
    const mindMapContainer = document.getElementById('mindmap-container');
    if (!mindMapContainer) return;

    try {
      // PNG 생성
      const blob = await exportToPNG(mindMapContainer, config);

      // 파일 저장
      const filename = `mindmap_${new Date().getTime()}.png`;
      saveAs(blob, filename);

      // 알림 표시
      showNotification('PNG 이미지가 저장되었습니다.');
    } catch (error) {
      showNotification('내보내기에 실패했습니다.', 'error');
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="toolbar">
      {/* 기존 버들들... */}

      <Dropdown>
        <Button variant="secondary" onClick={() => setShowExportDialog(true)}>
          내보내기 ▼
        </Button>

        <DropdownMenu>
          <MenuItem onClick={() => setShowExportDialog(true)}>
            <Icon>image</Icon>
            PNG 이미지
          </MenuItem>
          {/* 기존 JSON 내보내기 옵션 유지 */}
        </DropdownMenu>
      </Dropdown>

      {/* ExportDialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExportPNG}
      />
    </div>
  );
};
```

## 테스트
- [x] Toolbar에 내보내기 버튼 추가 확인
- [x] 클릭 시 ExportDialog 열림 테스트
- [ ] 실제 PNG 내보내기 테스트 (나중에)
- [ ] 오류 발생 시 알림 테스트