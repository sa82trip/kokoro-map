import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentCard from './DocumentCard';

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
});
