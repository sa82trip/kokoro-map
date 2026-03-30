import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentCard from './DocumentCard';
import useFileManagerStore from '../../store/FileManagerStore';

// FolderPickerDialog 모킹
jest.mock('./FolderPickerDialog', () => {
  return function MockFolderPickerDialog({ docId, onSelect, onCancel }) {
    return (
      <div data-testid="folder-picker">
        <button data-testid="picker-select" onClick={() => onSelect(docId, 'f-1')} />
        <button data-testid="picker-cancel-btn" onClick={onCancel} />
      </div>
    );
  };
});

describe('DocumentCard', () => {
  const mockDocument = {
    id: 'test-doc-1',
    title: '테스트 마인드맵',
    folderId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodeCount: 5,
    thumbnail: null
  };

  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFileManagerStore.setState({
      folders: [
        { id: 'f-1', name: '작업 폴더', parentId: null }
      ]
    });
  });

  test('문서 제목을 렌더링한다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    expect(screen.getByText('테스트 마인드맵')).toBeInTheDocument();
  });

  test('노드 수를 표시한다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    expect(screen.getByText('5개 노드')).toBeInTheDocument();
  });

  test('카드 클릭 시 onClick이 호출된다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByText('테스트 마인드맵'));
    expect(mockOnClick).toHaveBeenCalledWith('test-doc-1');
  });

  test('삭제 버튼 클릭 시 확인 다이얼로그가 표시된다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    const deleteBtn = screen.getByLabelText('문서 삭제');
    fireEvent.click(deleteBtn);
    expect(screen.getByText('이 문서를 삭제하시겠습니까?')).toBeInTheDocument();
  });

  test('삭제 확인 시 onDelete가 호출된다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    const deleteBtn = screen.getByLabelText('문서 삭제');
    fireEvent.click(deleteBtn);
    const confirmBtn = screen.getByText('삭제');
    fireEvent.click(confirmBtn);
    expect(mockOnDelete).toHaveBeenCalledWith('test-doc-1');
  });

  test('삭제 취소 시 다이얼로그가 닫힌다', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    const deleteBtn = screen.getByLabelText('문서 삭제');
    fireEvent.click(deleteBtn);
    const cancelBtn = screen.getByText('취소');
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('이 문서를 삭제하시겠습니까?')).not.toBeInTheDocument();
  });

  test('썸네일이 있으면 이미지를 표시한다', () => {
    const docWithThumbnail = {
      ...mockDocument,
      thumbnail: 'data:image/png;base64,test'
    };
    render(<DocumentCard document={docWithThumbnail} onClick={mockOnClick} onDelete={mockOnDelete} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  test('시간 포맷이 올바르다 — 방금 전', () => {
    render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });

  test('시간 포맷이 올바르다 — N분 전', () => {
    const doc = {
      ...mockDocument,
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
    };
    render(<DocumentCard document={doc} onClick={mockOnClick} onDelete={mockOnDelete} />);
    expect(screen.getByText('30분 전')).toBeInTheDocument();
  });

  describe('검색 하이라이트', () => {
    test('highlight prop이 없으면 일반 텍스트를 렌더링한다', () => {
      render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
      const titleEl = screen.getByText('테스트 마인드맵');
      expect(titleEl.tagName).toBe('H3');
    });

    test('highlight prop이 있으면 매칭 부분을 mark 태그로 강조한다', () => {
      render(
        <DocumentCard
          document={mockDocument}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          highlight="마인드"
        />
      );
      const mark = screen.getByText('마인드');
      expect(mark.tagName).toBe('MARK');
      // 전체 텍스트 확인
      const title = mark.closest('.document-card-title');
      expect(title.textContent).toBe('테스트 마인드맵');
    });

    test('highlight와 매칭되지 않으면 일반 텍스트를 렌더링한다', () => {
      render(
        <DocumentCard
          document={mockDocument}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          highlight="없는키워드"
        />
      );
      const titleEl = screen.getByText('테스트 마인드맵');
      expect(titleEl.tagName).toBe('H3');
    });

    test('대소문자 무관하게 매칭한다', () => {
      const doc = { ...mockDocument, title: 'React Study' };
      render(
        <DocumentCard
          document={doc}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          highlight="react"
        />
      );
      const mark = screen.getByText('React');
      expect(mark.tagName).toBe('MARK');
    });

    test('여러 매칭이 있어도 모두 하이라이트된다', () => {
      const doc = { ...mockDocument, title: '프로젝트 계획 프로젝트' };
      render(
        <DocumentCard
          document={doc}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          highlight="프로젝트"
        />
      );
      const marks = document.querySelectorAll('mark');
      expect(marks).toHaveLength(2);
    });
  });

  describe('폴더 기능', () => {
    test('folderId가 있으면 폴더 태그를 표시한다', () => {
      const doc = { ...mockDocument, folderId: 'f-1' };
      render(<DocumentCard document={doc} onClick={mockOnClick} onDelete={mockOnDelete} />);
      expect(screen.getByTestId('folder-tag')).toBeInTheDocument();
      expect(screen.getByTestId('folder-tag').textContent).toBe('작업 폴더');
    });

    test('folderId가 null이면 폴더 태그가 없다', () => {
      render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
      expect(screen.queryByTestId('folder-tag')).not.toBeInTheDocument();
    });

    test('이동 버튼 클릭 시 FolderPickerDialog가 열린다', () => {
      render(<DocumentCard document={mockDocument} onClick={mockOnClick} onDelete={mockOnDelete} />);
      fireEvent.click(screen.getByTestId('move-folder-btn'));
      expect(screen.getByTestId('folder-picker')).toBeInTheDocument();
    });
  });
});
